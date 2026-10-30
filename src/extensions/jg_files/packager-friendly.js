const { validateArray } = require('../../util/json-block-utilities')
class JgFilesBlocks {
    constructor(runtime, id) {
        //cq: ignore
        //ext stuff
        this.runtime = runtime;
        this.menuIconURI = null;
        this.blockIconURI = null;
        this.colorScheme = ["#ffbb00", "ffaa00"];
      }
      
    getInfo() {
        return {
            id: 'JgFilesBlocks',
            name: 'Files',
            blockIconURI: this.blockIconURI,
            menuIconURI: this.menuIconURI,
            color1: this.colorScheme[0],
            color2: this.colorScheme[1],
            blocks: [
                {
                    opcode: 'isFileReaderSupported',
                    text: 'can files be used?',
                    disableMonitor: false,
                    blockType: Scratch.BlockType.BOOLEAN
                },
                {
                    opcode: 'askUserForFile',
                    text: 'ask user for a file',
                    disableMonitor: true,
                    blockType: Scratch.BlockType.REPORTER
                },
                {
                    opcode: 'askUserForFileOfType',
                    text: 'ask user for a file of type [FILE_TYPE]',
                    disableMonitor: true,
                    blockType: Scratch.BlockType.REPORTER,
                    arguments: {
                        FILE_TYPE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'any'
                        }
                    }
                },
                {
                    opcode: 'downloadFile',
                    text: 'download content [FILE_CONTENT] as file name [FILE_NAME]',
                    blockType: Scratch.BlockType.COMMAND,
                    arguments: {
                        FILE_CONTENT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'Hello!'
                        },
                        FILE_NAME: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'text.txt'
                        }
                    }
                },
            ]
        }
    }
    isFileReaderSupported() {
        return (window.FileReader != null) && (window.document != null);
    }
    __askUserForFile(acceptTypes) {
        return new Promise((resolve, _) => {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                resolve(e.target.result);
            }
            const input = document.createElement("input");
            input.type = "file";
            if (acceptTypes != null) {
                input.accept = acceptTypes
            }
            input.style.display = "none";
            document.body.append(input);
            input.onchange = () => {
                const file = input.files[0];
                if (!file) {
                    resolve("[]");
                    return;
                } else {
                    fileReader.readAsArrayBuffer(file)
                }
                input.remove();
            }
            input.onblur = () => {
                input.onchange();
            }
            input.focus();
            input.click();
        })
    }
    askUserForFile() {
        return this.__askUserForFile(null);
    }
    askUserForFileOfType(args) {
        const fileTypesAllowed = [];
        const input = String(args.FILE_TYPE).toLowerCase().replace(/.,/gmi, "");
        if (input == "any")
            return this.__askUserForFile(null);
        input.split(" ").forEach(type => {
            fileTypesAllowed.push("." + type);
        })
        return this.__askUserForFile(fileTypesAllowed.join(","));
    }
    downloadFile(args) {
        let content = "";
        let fileName = "text.txt";
        content = String(args.FILE_CONTENT) || content;
        fileName = String(args.FILE_NAME) || fileName;

        const array = validateArray(args.FILE_CONTENT)
        if (array.length > 0 && typeof array[0] == 'number') {
            content = array
        }

        const blob = new Blob([content]);
        const a = document.createElement("a");
        a.style.display = "none";
        document.body.append(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
};
// Scratch.extensions.register(new JgFilesBlocks());
(function () {
  var extensionClass = JgFilesBlocks;
  if (typeof window === "undefined" || !window.vm) {
    console.error("JgFilesBlocks is not supported in this environment.");
  } else {
    var extensionInstance = new extensionClass(
      window.vm.extensionManager.runtime
    );
    var serviceName =
      window.vm.extensionManager._registerInternalExtension(extensionInstance);
    window.vm.extensionManager._loadedExtensions.set(
      extensionInstance.getInfo().id,
      serviceName
    );
    console.info("JgFilesBlocks has loaded.");
  }});
