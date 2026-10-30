const BlockType = require('../../extension-support/block-type')
const BlockShape = require('../../extension-support/block-shape')
const ArgumentType = require('../../extension-support/argument-type')
const TargetType = require('../../extension-support/target-type')
const Cast = require('../../util/cast')

let jwArray = {
    Type: class {},
    Block: {},
    Argument: {}
}

class Extension {
    constructor() {
        if (!vm.jwArray) vm.extensionManager.loadExtensionIdSync('jwArray')
        jwArray = vm.jwArray
    }

    getInfo() {
        return {
            id: "jwStorage",
            name: "Assets",
            color1: "#6f6df0",
            menuIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+CiAgPGNpcmNsZSBzdHlsZT0ic3Ryb2tlLXdpZHRoOiAyOyBwYWludC1vcmRlcjogc3Ryb2tlOyBzdHJva2U6IHJnYig4OCwgODcsIDE5Mik7IGZpbGw6IHJnYigxMTEsIDEwOSwgMjQwKTsiIGN4PSIxMCIgY3k9IjEwIiByPSI5Ij48L2NpcmNsZT4KICA8cGF0aCBkPSJNIDYuOTA2IDMuODEzIEMgNi4wNTMgMy44MTMgNS4zNiA0LjUwNiA1LjM2IDUuMzYgTCA1LjM2IDE0LjY0IEMgNS4zNiAxNS40OTQgNi4wNTMgMTYuMTg3IDYuOTA2IDE2LjE4NyBMIDEzLjA5NCAxNi4xODcgQyAxMy45NDcgMTYuMTg3IDE0LjY0IDE1LjQ5NCAxNC42NCAxNC42NCBMIDE0LjY0IDkuMjI3IEMgMTQuNjQgOC43MTIgMTQuMzgyIDguMTk1IDEzLjg2NyA3LjY4IEwgMTAuNzczIDQuNTg2IEMgMTAuMjU4IDQuMDcxIDkuNzQyIDMuODEzIDkuMjI3IDMuODEzIEwgNi45MDYgMy44MTMgWiBNIDguNDUzIDYuMTMzIEMgOC40NTMgNS4xMDEgOC45NjggNS4xMDEgMTAgNi4xMzMgTCAxMi4zMiA4LjQ1MyBDIDEzLjM1MiA5LjQ4NSAxMy4zNTIgMTAgMTIuMzIgMTAgTCAxMCAxMCBDIDkuMTQ2IDEwIDguNDUzIDkuMzA3IDguNDUzIDguNDUzIEwgOC40NTMgNi4xMzMgWiIgZmlsbD0iI2ZmZiIgc3R5bGU9InN0cm9rZS13aWR0aDogMTsiPjwvcGF0aD4KPC9zdmc+",
            blocks: [
                {
                    opcode: 'getFile',
                    text: 'get file [NAME] as [TYPE]',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "file.txt"
                        },
                        TYPE: {
                            menu: "fileExportType",
                            defaultValue: "text"
                        }
                    }
                },
                {
                    opcode: 'fileExists',
                    text: 'file/directory [NAME] exists?',
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "file.txt"
                        }
                    }
                },
                "---",
                {
                    opcode: 'getAllFiles',
                    text: 'get all files',
                    ...jwArray.Block
                },
                {
                    opcode: 'getAllDirectories',
                    text: 'get all directories',
                    ...jwArray.Block
                },
                {
                    opcode: 'getFilesInFolder',
                    text: 'get files in directory [NAME]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "folder"
                        }
                    },
                    ...jwArray.Block
                },
                {
                    opcode: 'getSubdirs',
                    text: 'get folders in directory [NAME]',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: "folder"
                        }
                    },
                    ...jwArray.Block
                }
            ],
            menus: {
                fileExportType: [
                    "text",
                    "base64"
                ],
            }
        };
    }

    async getFile({NAME, TYPE}) {
        if (!vm._projectZip.files["extraAssets/"]) return ""

        NAME = Cast.toString(NAME)
        TYPE = Cast.toString(TYPE)

        let file = vm._projectZip.folder("extraAssets").file(NAME)
        if (!file) return ""

        switch (TYPE) {
            case "text": return await file.async("text")
            case "base64": return await file.async("base64")
            default: return ""
        }
    }

    fileExists({NAME}) {
        if (!vm._projectZip.files["extraAssets/"]) return ""

        NAME = Cast.toString(NAME)
        if (NAME.endsWith("/")) NAME = NAME.substring(0, NAME.length-1)

        return !!(vm._projectZip.files[`extraAssets/${NAME}/`] || vm._projectZip.folder("extraAssets").file(NAME))
    }

    getAllFiles() {
        if (!vm._projectZip.files["extraAssets/"]) return new jwArray.Type()

        return new jwArray.Type(Object.values(vm._projectZip.files).filter(v => v.name.startsWith("extraAssets/") && !v.dir).map(v => v.name.substring(12)))
    }

    getAllDirectories() {
        if (!vm._projectZip.files["extraAssets/"]) return new jwArray.Type()

        return new jwArray.Type(Object.values(vm._projectZip.files).filter(v => v.name.startsWith("extraAssets/") && v.dir && v.name !== "extraAssets/").map(v => v.name.substring(12)))
    }

    getFilesInFolder({NAME}) {
        if (!vm._projectZip.files["extraAssets/"]) return new jwArray.Type()

        NAME = Cast.toString(NAME)
        if (!NAME.endsWith("/")) NAME += "/"
        
        let rootFolder = NAME == "/" ? `extraAssets/` : `extraAssets/${NAME}`
        let depth = rootFolder.split("/").length
        return new jwArray.Type(Object.values(vm._projectZip.files).filter(v => v.name.startsWith(rootFolder) && v.name.split("/").length == depth && !v.dir).map(v => v.name.substring(12)))
    }

    getSubdirs({NAME}) {
        if (!vm._projectZip.files["extraAssets/"]) return new jwArray.Type()

        NAME = Cast.toString(NAME)
        if (!NAME.endsWith("/")) NAME += "/"
        
        let rootFolder = NAME == "/" ? `extraAssets/` : `extraAssets/${NAME}`
        let depth = rootFolder.split("/").length
        return new jwArray.Type(Object.values(vm._projectZip.files).filter(v => v.name.startsWith(rootFolder) && v.name.split("/").length == depth+1 && v.dir).map(v => v.name.substring(12)))
    }
}

module.exports = Extension