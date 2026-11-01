const formatMessage = require('format-message');
const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');

/**
 * Encryption Tools - encoding, classic ciphers, AES-GCM, hashing, HMAC and
 * secure random generators for PenguinMod.
 *
 * NOTE: Classic ciphers (Caesar, Vigenere, Atbash, ROT13, XOR) are for
 * learning and fun only. Use AES-256-GCM for anything that needs real security.
 * @constructor
 */
class jwEncryption {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * Last error message produced by any block.
         * @type {string}
         */
        this.lastError = '';

        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder('utf-8', { fatal: true });
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            autoLoad: true,
            id: 'jwEncryption',
            name: 'Encryption Tools',
            color1: "#6c5ce7",
            color2: "#5849c9",
            color3: "#4a3db3",
            blocks: [
                {
                    blockType: BlockType.LABEL,
                    text: 'Encoding'
                },
                {
                    opcode: 'encode',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.encode',
                        default: 'encode [TEXT] as [ENCODING]',
                        description: 'Encode a string'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, world!'
                        },
                        ENCODING: {
                            type: ArgumentType.STRING,
                            menu: 'encodings',
                            defaultValue: 'base64'
                        }
                    }
                },
                {
                    opcode: 'decode',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.decode',
                        default: 'decode [TEXT] from [ENCODING]',
                        description: 'Decode a string'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'SGVsbG8sIHdvcmxkIQ=='
                        },
                        ENCODING: {
                            type: ArgumentType.STRING,
                            menu: 'encodings',
                            defaultValue: 'base64'
                        }
                    }
                },
                {
                    opcode: 'isValidEncoding',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.isValidEncoding',
                        default: 'is [TEXT] valid [ENCODING]?',
                        description: 'Check if a string is valid in an encoding'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'SGVsbG8='
                        },
                        ENCODING: {
                            type: ArgumentType.STRING,
                            menu: 'encodings',
                            defaultValue: 'base64'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'AES-256-GCM (secure)'
                },
                {
                    opcode: 'aesEncrypt',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.aesEncrypt',
                        default: 'AES encrypt [TEXT] with password [PASSWORD]',
                        description: 'Encrypt text with AES-GCM'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'secret message'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'my password'
                        }
                    }
                },
                {
                    opcode: 'aesDecrypt',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.aesDecrypt',
                        default: 'AES decrypt [TEXT] with password [PASSWORD]',
                        description: 'Decrypt text with AES-GCM'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'encrypted text'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'my password'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Hashing'
                },
                {
                    opcode: 'hash',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.hash',
                        default: '[ALGORITHM] hash of [TEXT]',
                        description: 'Hash a string'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'hashAlgorithms',
                            defaultValue: 'SHA-256'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        }
                    }
                },
                {
                    opcode: 'hmac',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.hmac',
                        default: 'HMAC [ALGORITHM] of [TEXT] with key [KEY]',
                        description: 'HMAC of a string'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'hashAlgorithms',
                            defaultValue: 'SHA-256'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'message'
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'secret key'
                        }
                    }
                },
                {
                    opcode: 'hashMatches',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.hashMatches',
                        default: '[ALGORITHM] hash of [TEXT] equals [HASH]?',
                        description: 'Check if a hash matches'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'hashAlgorithms',
                            defaultValue: 'SHA-256'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'hello'
                        },
                        HASH: {
                            type: ArgumentType.STRING,
                            defaultValue: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Classic ciphers (for fun)'
                },
                {
                    opcode: 'caesar',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.caesar',
                        default: 'Caesar [MODE] [TEXT] shift [SHIFT]',
                        description: 'Caesar cipher'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'cipherModes',
                            defaultValue: 'encrypt'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, world!'
                        },
                        SHIFT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 3
                        }
                    }
                },
                {
                    opcode: 'vigenere',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.vigenere',
                        default: 'Vigenere [MODE] [TEXT] key [KEY]',
                        description: 'Vigenere cipher'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'cipherModes',
                            defaultValue: 'encrypt'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Attack at dawn'
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'lemon'
                        }
                    }
                },
                {
                    opcode: 'atbash',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.atbash',
                        default: 'Atbash [TEXT]',
                        description: 'Atbash cipher (same for encrypt and decrypt)'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, world!'
                        }
                    }
                },
                {
                    opcode: 'rot13',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.rot13',
                        default: 'ROT13 [TEXT]',
                        description: 'ROT13 (same for encrypt and decrypt)'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, world!'
                        }
                    }
                },
                {
                    opcode: 'xorCipher',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.xorCipher',
                        default: 'XOR [MODE] [TEXT] key [KEY]',
                        description: 'XOR cipher (hex output)'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'cipherModes',
                            defaultValue: 'encrypt'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello, world!'
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Random & passwords'
                },
                {
                    opcode: 'randomString',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.randomString',
                        default: 'secure random [CHARSET] string of length [LENGTH]',
                        description: 'Generate a secure random string'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        CHARSET: {
                            type: ArgumentType.STRING,
                            menu: 'charsets',
                            defaultValue: 'letters and numbers'
                        },
                        LENGTH: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 16
                        }
                    }
                },
                {
                    opcode: 'randomBytes',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.randomBytes',
                        default: 'secure random bytes [COUNT] as [ENCODING]',
                        description: 'Generate secure random bytes'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 32
                        },
                        ENCODING: {
                            type: ArgumentType.STRING,
                            menu: 'byteEncodings',
                            defaultValue: 'hex'
                        }
                    }
                },
                {
                    opcode: 'uuid',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.uuid',
                        default: 'random UUID',
                        description: 'Generate a random UUID v4'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'passwordStrength',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.passwordStrength',
                        default: 'strength (0-100) of password [PASSWORD]',
                        description: 'Estimate password strength'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'correct horse battery staple'
                        }
                    }
                },
                {
                    opcode: 'passwordEntropy',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.passwordEntropy',
                        default: 'entropy in bits of [PASSWORD]',
                        description: 'Estimate password entropy in bits'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'correct horse battery staple'
                        }
                    }
                },

                '---',

                {
                    blockType: BlockType.LABEL,
                    text: 'Utility'
                },
                {
                    opcode: 'isSupported',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.isSupported',
                        default: 'secure crypto supported?',
                        description: 'Check if Web Crypto is available'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.BOOLEAN
                },
                {
                    opcode: 'getLastError',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.getLastError',
                        default: 'last error',
                        description: 'Get the last error message'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.REPORTER
                },
                {
                    opcode: 'clearError',
                    text: formatMessage({
                        id: 'jwEncryption.blocks.clearError',
                        default: 'clear last error',
                        description: 'Clear the last error message'
                    }),
                    disableMonitor: true,
                    blockType: BlockType.COMMAND
                }
            ],
            menus: {
                encodings: {
                    acceptReporters: true,
                    items: ['base64', 'base64url', 'hex', 'binary', 'url']
                },
                byteEncodings: {
                    acceptReporters: true,
                    items: ['hex', 'base64', 'base64url', 'binary']
                },
                hashAlgorithms: {
                    acceptReporters: true,
                    items: ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1']
                },
                cipherModes: {
                    acceptReporters: true,
                    items: ['encrypt', 'decrypt']
                },
                charsets: {
                    acceptReporters: true,
                    items: [
                        'letters and numbers',
                        'letters',
                        'numbers',
                        'hex',
                        'letters, numbers and symbols'
                    ]
                }
            }
        };
    }

    _fail(message) {
        this.lastError = String(message);
        return '';
    }

    _getSubtle() {
        if (typeof crypto !== 'undefined' && crypto.subtle) return crypto.subtle;
        return null;
    }

    _bytesToHex(bytes) {
        let out = '';
        for (let i = 0; i < bytes.length; i++) {
            out += bytes[i].toString(16).padStart(2, '0');
        }
        return out;
    }

    _hexToBytes(hex) {
        const clean = String(hex).replace(/\s+/g, '');
        if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) {
            throw new Error('Invalid hex string');
        }
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    _bytesToBinary(bytes) {
        return Array.from(bytes, b => b.toString(2).padStart(8, '0')).join(' ');
    }

    _binaryToBytes(text) {
        const clean = String(text).replace(/\s+/g, '');
        if (clean.length === 0 || clean.length % 8 !== 0 || /[^01]/.test(clean)) {
            throw new Error('Invalid binary string');
        }
        const bytes = new Uint8Array(clean.length / 8);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(clean.substr(i * 8, 8), 2);
        }
        return bytes;
    }

    _bytesToBase64(bytes) {
        let binary = '';
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(binary);
    }

    _base64ToBytes(text) {
        let clean = String(text).replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
        if (/[^A-Za-z0-9+/=]/.test(clean)) {
            throw new Error('Invalid base64 string');
        }
        clean = clean.replace(/=+$/, '');
        if (clean.length % 4 === 1) {
            throw new Error('Invalid base64 string');
        }
        while (clean.length % 4 !== 0) clean += '=';
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    _toBase64Url(base64) {
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    _encodeBytes(bytes, encoding) {
        switch (encoding) {
            case 'hex': return this._bytesToHex(bytes);
            case 'binary': return this._bytesToBinary(bytes);
            case 'base64url': return this._toBase64Url(this._bytesToBase64(bytes));
            case 'base64':
            default: return this._bytesToBase64(bytes);
        }
    }

    _decodeToBytes(text, encoding) {
        switch (encoding) {
            case 'hex': return this._hexToBytes(text);
            case 'binary': return this._binaryToBytes(text);
            case 'base64url':
            case 'base64':
            default: return this._base64ToBytes(text);
        }
    }

    _randomInt(max) {
        const limit = Math.floor(0x100000000 / max) * max;
        const buf = new Uint32Array(1);
        let value;
        do {
            crypto.getRandomValues(buf);
            value = buf[0];
        } while (value >= limit);
        return value % max;
    }

    async _deriveAesKey(password, salt) {
        const subtle = this._getSubtle();
        const baseKey = await subtle.importKey(
            'raw',
            this.textEncoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );
        return subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 150000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    _normalizeHash(algorithm) {
        const algo = String(algorithm).toUpperCase().replace(/[^A-Z0-9]/g, '');
        switch (algo) {
            case 'SHA1': return 'SHA-1';
            case 'SHA256': return 'SHA-256';
            case 'SHA384': return 'SHA-384';
            case 'SHA512': return 'SHA-512';
            default: return null;
        }
    }

    _shiftLetters(text, shift) {
        const s = ((shift % 26) + 26) % 26;
        let out = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                out += String.fromCharCode(((code - 65 + s) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                out += String.fromCharCode(((code - 97 + s) % 26) + 97);
            } else {
                out += text.charAt(i);
            }
        }
        return out;
    }

    _charsetFor(name) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()-_=+[]{};:,.<>?/~';
        switch (String(name).toLowerCase()) {
            case 'letters': return letters;
            case 'numbers': return numbers;
            case 'hex': return '0123456789abcdef';
            case 'letters, numbers and symbols': return letters + numbers + symbols;
            case 'letters and numbers':
            default: return letters + numbers;
        }
    }

    _poolSize(password) {
        let pool = 0;
        if (/[a-z]/.test(password)) pool += 26;
        if (/[A-Z]/.test(password)) pool += 26;
        if (/[0-9]/.test(password)) pool += 10;
        if (/[^A-Za-z0-9]/.test(password)) pool += 32;
        return pool;
    }

    _entropy(password) {
        const text = String(password);
        if (text.length === 0) return 0;
        const pool = this._poolSize(text);
        let bits = text.length * Math.log2(Math.max(pool, 1));
        // Penalise repeated characters (e.g. "aaaaaa").
        const unique = new Set(text).size;
        bits *= Math.min(1, (unique / text.length) + 0.25);
        return bits;
    }
    encode(args) {
        try {
            const text = String(args.TEXT);
            const encoding = String(args.ENCODING).toLowerCase();
            if (encoding === 'url') {
                return encodeURIComponent(text);
            }
            return this._encodeBytes(this.textEncoder.encode(text), encoding);
        } catch (e) {
            return this._fail(e.message);
        }
    }

    decode(args) {
        try {
            const text = String(args.TEXT);
            const encoding = String(args.ENCODING).toLowerCase();
            if (encoding === 'url') {
                return decodeURIComponent(text);
            }
            return this.textDecoder.decode(this._decodeToBytes(text, encoding));
        } catch (e) {
            return this._fail(e.message || 'Could not decode text');
        }
    }

    isValidEncoding(args) {
        try {
            const text = String(args.TEXT);
            const encoding = String(args.ENCODING).toLowerCase();
            if (encoding === 'url') {
                decodeURIComponent(text);
                return true;
            }
            this._decodeToBytes(text, encoding);
            return true;
        } catch (e) {
            return false;
        }
    }

    async aesEncrypt(args) {
        const subtle = this._getSubtle();
        if (!subtle) return this._fail('Secure crypto is not available (needs HTTPS).');
        try {
            const password = String(args.PASSWORD);
            if (password.length === 0) return this._fail('Password cannot be empty.');
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const key = await this._deriveAesKey(password, salt);
            const cipher = new Uint8Array(await subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                this.textEncoder.encode(String(args.TEXT))
            ));
            const packed = new Uint8Array(salt.length + iv.length + cipher.length);
            packed.set(salt, 0);
            packed.set(iv, salt.length);
            packed.set(cipher, salt.length + iv.length);
            return this._bytesToBase64(packed);
        } catch (e) {
            return this._fail(e.message || 'Encryption failed');
        }
    }

    async aesDecrypt(args) {
        const subtle = this._getSubtle();
        if (!subtle) return this._fail('Secure crypto is not available (needs HTTPS).');
        try {
            const password = String(args.PASSWORD);
            if (password.length === 0) return this._fail('Password cannot be empty.');
            const packed = this._base64ToBytes(String(args.TEXT));
            if (packed.length < 16 + 12 + 16) {
                return this._fail('Encrypted data is too short or corrupted.');
            }
            const salt = packed.slice(0, 16);
            const iv = packed.slice(16, 28);
            const cipher = packed.slice(28);
            const key = await this._deriveAesKey(password, salt);
            const plain = await subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, cipher);
            return this.textDecoder.decode(plain);
        } catch (e) {
            return this._fail('Decryption failed (wrong password or corrupted data).');
        }
    }

    async _hashHex(algorithm, text) {
        const subtle = this._getSubtle();
        if (!subtle) throw new Error('Secure crypto is not available (needs HTTPS).');
        const algo = this._normalizeHash(algorithm);
        if (!algo) throw new Error('Unknown hash algorithm');
        const digest = await subtle.digest(algo, this.textEncoder.encode(String(text)));
        return this._bytesToHex(new Uint8Array(digest));
    }

    async hash(args) {
        try {
            return await this._hashHex(args.ALGORITHM, args.TEXT);
        } catch (e) {
            return this._fail(e.message);
        }
    }

    async hmac(args) {
        const subtle = this._getSubtle();
        if (!subtle) return this._fail('Secure crypto is not available (needs HTTPS).');
        try {
            const algo = this._normalizeHash(args.ALGORITHM);
            if (!algo) return this._fail('Unknown hash algorithm');
            const key = await subtle.importKey(
                'raw',
                this.textEncoder.encode(String(args.KEY)),
                { name: 'HMAC', hash: algo },
                false,
                ['sign']
            );
            const sig = await subtle.sign('HMAC', key, this.textEncoder.encode(String(args.TEXT)));
            return this._bytesToHex(new Uint8Array(sig));
        } catch (e) {
            return this._fail(e.message);
        }
    }

    async hashMatches(args) {
        try {
            const computed = await this._hashHex(args.ALGORITHM, args.TEXT);
            const expected = String(args.HASH).trim().toLowerCase();
            if (computed.length !== expected.length) return false;
            // Constant-time-style comparison.
            let diff = 0;
            for (let i = 0; i < computed.length; i++) {
                diff |= computed.charCodeAt(i) ^ expected.charCodeAt(i);
            }
            return diff === 0;
        } catch (e) {
            this._fail(e.message);
            return false;
        }
    }

    caesar(args) {
        const shift = Math.trunc(Number(args.SHIFT)) || 0;
        const decrypt = String(args.MODE).toLowerCase() === 'decrypt';
        return this._shiftLetters(String(args.TEXT), decrypt ? -shift : shift);
    }

    vigenere(args) {
        const text = String(args.TEXT);
        const key = String(args.KEY).toLowerCase().replace(/[^a-z]/g, '');
        if (key.length === 0) {
            return this._fail('Vigenere key must contain at least one letter.');
        }
        const decrypt = String(args.MODE).toLowerCase() === 'decrypt';
        let out = '';
        let k = 0;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            const isUpper = code >= 65 && code <= 90;
            const isLower = code >= 97 && code <= 122;
            if (isUpper || isLower) {
                const base = isUpper ? 65 : 97;
                let shift = key.charCodeAt(k % key.length) - 97;
                if (decrypt) shift = -shift;
                out += String.fromCharCode(((code - base + shift + 26) % 26) + base);
                k++;
            } else {
                out += text.charAt(i);
            }
        }
        return out;
    }

    atbash(args) {
        const text = String(args.TEXT);
        let out = '';
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                out += String.fromCharCode(90 - (code - 65));
            } else if (code >= 97 && code <= 122) {
                out += String.fromCharCode(122 - (code - 97));
            } else {
                out += text.charAt(i);
            }
        }
        return out;
    }

    rot13(args) {
        return this._shiftLetters(String(args.TEXT), 13);
    }

    xorCipher(args) {
        try {
            const keyBytes = this.textEncoder.encode(String(args.KEY));
            if (keyBytes.length === 0) return this._fail('XOR key cannot be empty.');
            const decrypt = String(args.MODE).toLowerCase() === 'decrypt';
            const input = decrypt ?
                this._hexToBytes(String(args.TEXT)) :
                this.textEncoder.encode(String(args.TEXT));
            const output = new Uint8Array(input.length);
            for (let i = 0; i < input.length; i++) {
                output[i] = input[i] ^ keyBytes[i % keyBytes.length];
            }
            return decrypt ? this.textDecoder.decode(output) : this._bytesToHex(output);
        } catch (e) {
            return this._fail(e.message || 'XOR failed');
        }
    }
    randomString(args) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            return this._fail('Secure random is not available.');
        }
        const length = Math.max(1, Math.min(4096, Math.trunc(Number(args.LENGTH)) || 1));
        const charset = this._charsetFor(args.CHARSET);
        let out = '';
        for (let i = 0; i < length; i++) {
            out += charset.charAt(this._randomInt(charset.length));
        }
        return out;
    }

    randomBytes(args) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            return this._fail('Secure random is not available.');
        }
        const count = Math.max(1, Math.min(4096, Math.trunc(Number(args.COUNT)) || 1));
        const bytes = new Uint8Array(count);
        crypto.getRandomValues(bytes);
        return this._encodeBytes(bytes, String(args.ENCODING).toLowerCase());
    }

    uuid() {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            return this._fail('Secure random is not available.');
        }
        if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
        const b = crypto.getRandomValues(new Uint8Array(16));
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        const h = this._bytesToHex(b);
        return `${h.substr(0, 8)}-${h.substr(8, 4)}-${h.substr(12, 4)}-${h.substr(16, 4)}-${h.substr(20, 12)}`;
    }

    passwordEntropy(args) {
        return Math.round(this._entropy(args.PASSWORD) * 100) / 100;
    }

    passwordStrength(args) {
        const bits = this._entropy(args.PASSWORD);
        return Math.max(0, Math.min(100, Math.round((bits / 100) * 100)));
    }

    isSupported() {
        return !!(this._getSubtle() && typeof crypto.getRandomValues === 'function');
    }

    getLastError() {
        return this.lastError;
    }

    clearError() {
        this.lastError = '';
    }
}

module.exports = jwEncryption;