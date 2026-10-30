const BlockType = require('../../extension-support/block-type');
const ArgumentType = require('../../extension-support/argument-type');
const ProjectPermissionManager = require('../../util/project-permissions');

/**
 * Class for Permission blocks
 * @constructor
 */
class JgPermissionBlocks {
    constructor(runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'JgPermissionBlocks',
            name: 'Permissions',
            color1: '#00C4FF',
            color2: '#0093FF',
            blocks: [
                {
                    blockType: BlockType.LABEL,
                    text: "This extension is deprecated."
                },
                // tw says deleting menu elements is unsafe
                // blocks below this are hidden
                { hideFromPalette: true, opcode: 'requestPermission', text: 'request [PERMISSION] permission', disableMonitor: false, blockType: BlockType.BOOLEAN, arguments: { PERMISSION: { type: ArgumentType.STRING, menu: 'permissions', defaultValue: "javascript" } } },
                { hideFromPalette: true, opcode: 'requestPermission2', text: 'request [PERMISSION] permission', disableMonitor: false, blockType: BlockType.BOOLEAN, arguments: { PERMISSION: { type: ArgumentType.STRING, menu: 'permissions2' } } },
                { hideFromPalette: true, opcode: 'requestAllPermission', text: 'request all permissions', disableMonitor: false, blockType: BlockType.BOOLEAN },
                { hideFromPalette: true, opcode: 'requestSitePermission', text: 'request permission to show [URL]', disableMonitor: false, blockType: BlockType.BOOLEAN, arguments: { URL: { type: ArgumentType.STRING, defaultValue: "https://www.example.com" } } },
            ],
            menus: {
                // tw says deleting menu elements is unsafe
                // menus below this are hidden
                permissions: "fetchPermissionsList",
                permissions2: "fetchPermissionsList2"
            }
        };
    }

    fetchPermissionsList() {
        return Object.getOwnPropertyNames(ProjectPermissionManager.permissions).filter(name => typeof ProjectPermissionManager.permissions[name] === "boolean").map(permissionName => ({
            text: permissionName,
            value: permissionName
        }));
    }

    fetchPermissionsList2() {
        // tw says deleting menu elements is unsafe
        return Object.getOwnPropertyNames(ProjectPermissionManager.permissions).filter(name => typeof ProjectPermissionManager.permissions[name] === "boolean").filter(name => name !== "javascript").map(permissionName => ({
            text: permissionName,
            value: permissionName
        }));
    }

    requestPermission(args) {
        const permission = args.PERMISSION;
        if (ProjectPermissionManager.permissions[permission] == true) return true;
        return ProjectPermissionManager.RequestPermission(permission);
    }
    requestPermission2(args) {
        // tw says deleting menu elements is unsafe
        const permission = args.PERMISSION;
        if (ProjectPermissionManager.permissions[permission] == true) return true;
        return ProjectPermissionManager.RequestPermission(permission);
    }
    requestAllPermission() {
        return ProjectPermissionManager.RequestAllPermissions();
    }
    requestSitePermission(args) {
        const site = args.URL;
        if (ProjectPermissionManager.permissions.limitedWebsites[site] == true) return true;
        return ProjectPermissionManager.RequestPermission("limitedWebsite", site);
    }
}

module.exports = JgPermissionBlocks;
