const formatMessage = require('format-message');
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;


const PY_HELPERS = String.raw`
import json
import inspect
import builtins
import sys

def __jw_fmt(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    try:
        if hasattr(value, "to_py"):
            value = value.to_py()
        return json.dumps(value)
    except Exception:
        return str(value)

async def __jw_call(name, args_json):
    parts = name.split(".")
    root = parts[0]
    if root in globals():
        obj = globals()[root]
    elif hasattr(builtins, root):
        obj = getattr(builtins, root)
    else:
        raise NameError("name '%s' is not defined" % root)
    for part in parts[1:]:
        obj = getattr(obj, part)
    args = json.loads(args_json) if args_json.strip() else []
    if isinstance(args, dict):
        result = obj(**args)
    elif isinstance(args, list):
        result = obj(*args)
    else:
        result = obj(args)
    if inspect.isawaitable(result):
        result = await result
    return __jw_fmt(result)
`;

const WORKER_SOURCE = String.raw`
let pyodide = null;
let ns = null;
let helpersSource = '';
let stdoutBuf = [];
let stderrBuf = [];
let stdinLines = [];
let queue = Promise.resolve();

function callHelper(name, ...args) {
    const fn = ns.get(name);
    try {
        return fn(...args);
    } finally {
        fn.destroy();
    }
}

function newNamespace() {
    if (ns) ns.destroy();
    ns = pyodide.globals.get('dict')();
    ns.set('__name__', '__main__');
    pyodide.runPython(helpersSource, {globals: ns});
}

async function init(msg) {
    if (!pyodide) {
        importScripts(msg.indexURL + 'pyodide.js');
        pyodide = await loadPyodide({indexURL: msg.indexURL});
        pyodide.setStdout({batched: function (s) { stdoutBuf.push(s); }});
        pyodide.setStderr({batched: function (s) { stderrBuf.push(s); }});
        pyodide.setStdin({stdin: function () { return stdinLines.length ? stdinLines.shift() : null; }});
        helpersSource = msg.helpers;
        newNamespace();
    }
    return {
        ok: true,
        result: '',
        version: pyodide.runPython('import sys; sys.version.split()[0]'),
        stdout: '',
        stderr: ''
    };
}

async function capture(msg, fn) {
    stdoutBuf = [];
    stderrBuf = [];
    stdinLines = msg.stdin ? String(msg.stdin).split('\n') : [];
    try {
        const result = await fn();
        return {
            ok: true,
            result: (result === undefined || result === null) ? '' : String(result),
            stdout: stdoutBuf.join('\n'),
            stderr: stderrBuf.join('\n')
        };
    } catch (e) {
        return {
            ok: false,
            error: String(e && e.message ? e.message : e),
            stdout: stdoutBuf.join('\n'),
            stderr: stderrBuf.join('\n')
        };
    }
}

async function handle(msg) {
    if (msg.type === 'init') return await init(msg);
    if (!pyodide) throw new Error('Python is not loaded.');

    switch (msg.type) {
    case 'run':
        return await capture(msg, async function () {
            try {
                await pyodide.loadPackagesFromImports(msg.code);
            } catch (e) {
                
            }
            const value = await pyodide.runPythonAsync(msg.code, {globals: ns});
            if (value === undefined) return '';
            const text = callHelper('__jw_fmt', value);
            if (value && typeof value.destroy === 'function') value.destroy();
            return text;
        });
    case 'eval':
        return await capture(msg, async function () {
            try {
                await pyodide.loadPackagesFromImports(msg.expr);
            } catch (e) {
                // Ignore.
            }
            ns.set('__jw_expr', msg.expr);
            return await pyodide.runPythonAsync('__jw_fmt(eval(__jw_expr))', {globals: ns});
        });
    case 'call':
        return await capture(msg, async function () {
            ns.set('__jw_name', msg.name);
            ns.set('__jw_args', msg.args);
            return await pyodide.runPythonAsync('await __jw_call(__jw_name, __jw_args)', {globals: ns});
        });
    case 'setVar':
        return await capture(msg, async function () {
            let value = msg.value;
            if (msg.kind === 'number') {
                value = Number(msg.value);
                if (Number.isNaN(value)) throw new Error('Value is not a valid number.');
            } else if (msg.kind === 'boolean') {
                value = String(msg.value).toLowerCase() === 'true';
            } else if (msg.kind === 'JSON') {
                const proxy = pyodide.toPy(JSON.parse(msg.value));
                ns.set(msg.name, proxy);
                if (proxy && typeof proxy.destroy === 'function') proxy.destroy();
                return '';
            } else {
                value = String(msg.value);
            }
            ns.set(msg.name, value);
            return '';
        });
    case 'getVar':
        return await capture(msg, async function () {
            if (!ns.has(msg.name)) {
                throw new Error("NameError: name '" + msg.name + "' is not defined");
            }
            const value = ns.get(msg.name);
            const text = callHelper('__jw_fmt', value);
            if (value && typeof value.destroy === 'function') value.destroy();
            return text;
        });
    case 'install':
        return await capture(msg, async function () {
            await pyodide.loadPackage('micropip');
            const micropip = pyodide.pyimport('micropip');
            try {
                await micropip.install(msg.pkg);
            } finally {
                micropip.destroy();
            }
            return '';
        });
    case 'reset':
        return await capture(msg, async function () {
            newNamespace();
            return '';
        });
    default:
        throw new Error('Unknown request: ' + msg.type);
    }
}

self.onmessage = function (event) {
    const msg = event.data;
    queue = queue.then(async function () {
        let reply;
        try {
            reply = await handle(msg);
        } catch (e) {
            reply = {ok: false, error: String(e && e.message ? e.message : e), stdout: '', stderr: ''};
        }
        self.postMessage({id: msg.id, reply: reply});
    });
};
`;

/**
 * Class for Python blocks
 * @constructor
 */
class vsPython {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this.worker = null;
        this.workerURL = null;
        this.readyPromise = null;
        this.ready = false;
        this.loading = false;

        this.nextId = 0;
        this.pending = new Map();
        this.activeRuns = 0;

        this.pythonVersion = '';
        this.timeoutMs = 60000;
        this.stdinText = '';

        this.lastOutput = '';
        this.lastStderr = '';
        this.lastResult = '';
        this.lastError = '';
        this.lastTraceback = '';

      
        try {
            this.runtime.on('PROJECT_STOP_ALL', () => {
                if (this.activeRuns > 0) this._terminate('Stopped by user.');
            });
        } catch (e) {
          
        }
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            autoLoad: true,
            id: 'python',
            name: 'Python',
            color1: "#6c5ce7",
            color2: "#5849c9",
            color3: "#4a3db3",
            blocks: [
                {
                    blockType: BlockType.LABEL,
                    text: 'Setup'
                },
                {
                    opcode: 'loadPython',
                    text: formatMessage({
                        id: 'python.blocks.loadPython',
                        default: 'load Python',
                        description: 'Load the Python runtime (optional, it loads automatically on first use)'
                    }),
                    blockType: BlockType.COMMAND
                },
                {
                    opcode: 'isReady',
                    text: formatMessage({
                        id: 'python.blocks.isReady',
                        default: 'Python loaded?',
                        description: 'Is Python loaded'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'isRunning',
                    text: formatMessage({
                        id: 'python.blocks.isRunning',
                        default: 'Python running?',
                        description: 'Is Python currently running something'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'getPythonVersion',
                    text: formatMessage({
                        id: 'python.blocks.getPythonVersion',
                        default: 'Python version',
                        description: 'Python version'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'installPackage',
                    text: formatMessage({
                        id: 'python.blocks.installPackage',
                        default: 'install package [PACKAGE]',
                        description: 'Install a package with micropip'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PACKAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'numpy'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Run code'
                },
                {
                    opcode: 'runCodeOutput',
                    text: formatMessage({
                        id: 'python.blocks.runCodeOutput',
                        default: 'output of running [CODE]',
                        description: 'Run Python code and report what it printed'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CODE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'print(sum(range(10)))'
                        }
                    }
                },
                {
                    opcode: 'evalExpression',
                    text: formatMessage({
                        id: 'python.blocks.evalExpression',
                        default: 'evaluate [EXPRESSION]',
                        description: 'Evaluate a Python expression'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        EXPRESSION: {
                            type: ArgumentType.STRING,
                            defaultValue: '2 ** 10'
                        }
                    }
                },
                {
                    opcode: 'callFunction',
                    text: formatMessage({
                        id: 'python.blocks.callFunction',
                        default: 'call function [NAME] with JSON arguments [ARGS]',
                        description: 'Call a Python function'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'max'
                        },
                        ARGS: {
                            type: ArgumentType.STRING,
                            defaultValue: '[3, 7, 5]'
                        }
                    }
                },
                {
                    opcode: 'indent',
                    text: formatMessage({
                        id: 'python.blocks.indent',
                        default: 'indent [LEVELS] level(s)',
                        description: 'Spaces for Python indentation'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        LEVELS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Variables'
                },
                {
                    opcode: 'setVariable',
                    text: formatMessage({
                        id: 'python.blocks.setVariable',
                        default: 'set Python variable [NAME] to [VALUE] as [TYPE]',
                        description: 'Set a Python variable'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'x'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '10'
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'valueTypes',
                            defaultValue: 'number'
                        }
                    }
                },
                {
                    opcode: 'getVariable',
                    text: formatMessage({
                        id: 'python.blocks.getVariable',
                        default: 'get Python variable [NAME]',
                        description: 'Get a Python variable'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'x'
                        }
                    }
                },
                {
                    opcode: 'setInput',
                    text: formatMessage({
                        id: 'python.blocks.setInput',
                        default: 'set input() text to [TEXT]',
                        description: 'Text that input() will read, one line per input() call'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Alice'
                        }
                    }
                },
                {
                    opcode: 'resetPython',
                    text: formatMessage({
                        id: 'python.blocks.resetPython',
                        default: 'reset Python variables',
                        description: 'Clear the Python namespace'
                    }),
                    blockType: BlockType.COMMAND
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Results'
                },
                {
                    opcode: 'getOutput',
                    text: formatMessage({
                        id: 'python.blocks.getOutput',
                        default: 'last output',
                        description: 'Text printed by the last run'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getResult',
                    text: formatMessage({
                        id: 'python.blocks.getResult',
                        default: 'last result',
                        description: 'Value of the last expression'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getStderr',
                    text: formatMessage({
                        id: 'python.blocks.getStderr',
                        default: 'last error output (stderr)',
                        description: 'Text written to stderr by the last run'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getError',
                    text: formatMessage({
                        id: 'python.blocks.getError',
                        default: 'last error',
                        description: 'Short description of the last error'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'getTraceback',
                    text: formatMessage({
                        id: 'python.blocks.getTraceback',
                        default: 'last error traceback',
                        description: 'Full traceback of the last error'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'clearResults',
                    text: formatMessage({
                        id: 'python.blocks.clearResults',
                        default: 'clear output and errors',
                        description: 'Clear stored output and errors'
                    }),
                    blockType: BlockType.COMMAND
                },

                '---',
                {
                    blockType: BlockType.LABEL,
                    text: 'Control'
                },
                {
                    opcode: 'whenFinished',
                    text: formatMessage({
                        id: 'python.blocks.whenFinished',
                        default: 'when Python finishes running',
                        description: 'Event that fires after code runs successfully'
                    }),
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false
                },
                {
                    opcode: 'whenError',
                    text: formatMessage({
                        id: 'python.blocks.whenError',
                        default: 'when Python has an error',
                        description: 'Event that fires when Python fails'
                    }),
                    blockType: BlockType.EVENT,
                    isEdgeActivated: false
                },
                {
                    opcode: 'setTimeLimit',
                    text: formatMessage({
                        id: 'python.blocks.setTimeLimit',
                        default: 'set Python time limit to [SECONDS] seconds (0 = none)',
                        description: 'Maximum run time for a script'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SECONDS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 60
                        }
                    }
                },
                {
                    opcode: 'stopPython',
                    text: formatMessage({
                        id: 'python.blocks.stopPython',
                        default: 'stop Python',
                        description: 'Stop Python and unload it (variables are lost)'
                    }),
                    blockType: BlockType.COMMAND
                }
            ],
            menus: {
                valueTypes: {
                    acceptReporters: true,
                    items: ['text', 'number', 'boolean', 'JSON']
                }
            }
        };
    }

    _spawn() {
        const blob = new Blob([WORKER_SOURCE], {type: 'application/javascript'});
        this.workerURL = URL.createObjectURL(blob);
        this.worker = new Worker(this.workerURL);

        this.worker.onmessage = event => {
            const {id, reply} = event.data;
            const entry = this.pending.get(id);
            if (!entry) return;
            this.pending.delete(id);
            if (entry.timer) clearTimeout(entry.timer);
            entry.resolve(reply);
        };

        this.worker.onerror = event => {
            this._terminate(`Python worker crashed: ${event.message || 'unknown error'}`);
        };
    }

    _terminate(reason) {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        if (this.workerURL) {
            URL.revokeObjectURL(this.workerURL);
            this.workerURL = null;
        }
        const pending = Array.from(this.pending.values());
        this.pending.clear();
        for (const entry of pending) {
            if (entry.timer) clearTimeout(entry.timer);
            entry.reject(new Error(reason));
        }
        this.ready = false;
        this.loading = false;
        this.readyPromise = null;
    }

    _request(type, payload, timeoutMs) {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                reject(new Error('Python is not loaded.'));
                return;
            }
            const id = ++this.nextId;
            const entry = {resolve, reject, timer: null};
            if (timeoutMs > 0) {
                entry.timer = setTimeout(() => {
                    this._terminate(`Timed out after ${timeoutMs / 1000} seconds. Python was stopped.`);
                }, timeoutMs);
            }
            this.pending.set(id, entry);
            this.worker.postMessage(Object.assign({id, type}, payload));
        });
    }

    _ensureReady() {
        if (this.readyPromise) return this.readyPromise;
        this._spawn();
        this.loading = true;
        this.readyPromise = this._request('init', {indexURL: PYODIDE_URL, helpers: PY_HELPERS}, 180000)
            .then(reply => {
                this.ready = true;
                this.loading = false;
                this.pythonVersion = reply.version || '';
            })
            .catch(error => {
                this._terminate('Failed to load Python.');
                throw error;
            });
        return this.readyPromise;
    }
    _cleanTraceback(text) {
        const lines = String(text).split('\n');
        const out = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Hide Pyodide's internal frames so the traceback only shows the user's code.
            if (/^\s*File "\/lib\/python/.test(line) && line.includes('_pyodide')) {
                while (i + 1 < lines.length && /^\s{4,}/.test(lines[i + 1])) i++;
                continue;
            }
            out.push(line);
        }
        return out.join('\n').trim();
    }

    _lastLine(text) {
        const lines = String(text).split('\n').map(l => l.trim()).filter(l => l.length > 0);
        return lines.length ? lines[lines.length - 1] : '';
    }

    /**
     * Run a request, store the results, fire events. Never throws.
     * @returns {Promise<object>} the reply ({ok, result, stdout, stderr, error?})
     */
    async _runTask(type, payload, fireFinished) {
        let reply;
        try {
            await this._ensureReady();
            this.activeRuns++;
            try {
                reply = await this._request(type, Object.assign({stdin: this.stdinText}, payload), this.timeoutMs);
            } finally {
                this.activeRuns--;
            }
        } catch (e) {
            reply = {ok: false, error: e && e.message ? e.message : String(e), stdout: '', stderr: ''};
        }

        if (type === 'run' || type === 'eval' || type === 'call') {
            this.lastOutput = reply.stdout || '';
            this.lastStderr = reply.stderr || '';
            this.lastResult = reply.ok ? (reply.result || '') : '';
        }

        if (reply.ok) {
            if (fireFinished) {
                this.lastError = '';
                this.lastTraceback = '';
                this.runtime.startHats('python_whenFinished');
            }
        } else {
            this.lastTraceback = this._cleanTraceback(reply.error || 'Unknown error');
            this.lastError = this._lastLine(this.lastTraceback);
            this.runtime.startHats('python_whenError');
        }
        return reply;
    }

    _validName(name) {
        return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
    }

    _setError(message) {
        this.lastTraceback = String(message);
        this.lastError = this._lastLine(message);
        this.runtime.startHats('python_whenError');
    }

    async loadPython() {
        try {
            await this._ensureReady();
        } catch (e) {
            this._setError(e && e.message ? e.message : e);
        }
    }

    isReady() {
        return this.ready;
    }

    isRunning() {
        return this.activeRuns > 0;
    }

    getPythonVersion() {
        return this.pythonVersion;
    }

    async installPackage(args) {
        const pkg = String(args.PACKAGE).trim();
        if (!/^[A-Za-z0-9_.\-[\]=<>!~, ]+$/.test(pkg)) {
            this._setError('Invalid package name.');
            return;
        }
        await this._runTask('install', {pkg}, false);
    }

    async runCodeOutput(args) {
        const reply = await this._runTask('run', {code: String(args.CODE)}, true);
        return reply.ok ? (reply.stdout || '') : '';
    }

    async evalExpression(args) {
        const reply = await this._runTask('eval', {expr: String(args.EXPRESSION)}, true);
        return reply.ok ? (reply.result || '') : '';
    }

    async callFunction(args) {
        const name = String(args.NAME).trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/.test(name)) {
            this._setError('Invalid function name.');
            return '';
        }
        const argText = String(args.ARGS);
        try {
            if (argText.trim() !== '') JSON.parse(argText);
        } catch (e) {
            this._setError('Arguments must be valid JSON, like [1, 2] or {"a": 1}.');
            return '';
        }
        const reply = await this._runTask('call', {name, args: argText}, true);
        return reply.ok ? (reply.result || '') : '';
    }


    indent(args) {
        const levels = Math.max(0, Math.min(50, Math.trunc(Number(args.LEVELS)) || 0));
        return '    '.repeat(levels);
    }

    async setVariable(args) {
        const name = String(args.NAME).trim();
        if (!this._validName(name)) {
            this._setError('Invalid variable name.');
            return;
        }
        const kind = String(args.TYPE);
        const value = String(args.VALUE);
        if (kind === 'JSON') {
            try {
                JSON.parse(value);
            } catch (e) {
                this._setError('Value is not valid JSON.');
                return;
            }
        }
        await this._runTask('setVar', {name, value, kind}, false);
    }

    async getVariable(args) {
        const name = String(args.NAME).trim();
        if (!this._validName(name)) {
            this._setError('Invalid variable name.');
            return '';
        }
        const reply = await this._runTask('getVar', {name}, false);
        return reply.ok ? (reply.result || '') : '';
    }

    setInput(args) {
        this.stdinText = String(args.TEXT);
    }

    async resetPython() {
        if (!this.ready) return;
        await this._runTask('reset', {}, false);
    }
    getOutput() {
        return this.lastOutput;
    }

    getResult() {
        return this.lastResult;
    }

    getStderr() {
        return this.lastStderr;
    }

    getError() {
        return this.lastError;
    }

    getTraceback() {
        return this.lastTraceback;
    }

    clearResults() {
        this.lastOutput = '';
        this.lastStderr = '';
        this.lastResult = '';
        this.lastError = '';
        this.lastTraceback = '';
    }

    setTimeLimit(args) {
        const seconds = Number(args.SECONDS);
        this.timeoutMs = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
    }

    stopPython() {
        this._terminate('Stopped by user.');
    }
}

module.exports = vsPython;