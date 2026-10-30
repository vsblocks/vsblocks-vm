/**
 * @deprecated Use `vm.securityManager` instead.
 */
class ProjectPermissionManager {
    static permissions = {
        javascript: true,
        camera: true,
        allWebsites: true,
        cameraPictures: false,
        scratchSignIn: true,

        limitedWebsites: {}
    };
    static permissionMessages = {
        javascript: "use custom code in JavaScript",
        camera: "turn on your camera",
        allWebsites: "display all websites",
        cameraPictures: "take screenshots while your camera is on",
        scratchSignIn: "sign in with Scratch",

        limitedWebsite: "display $0",
    };
    static permissionDrawbacks = {
        javascript: [],
        camera: [],
        allWebsites: [],
        cameraPictures: ["take a screenshot while your camera is visible"],
        scratchSignIn: [],

        limitedWebsite: [],
    };
    static requiresCode = [];
    static disabledPermissions = [];

    static get skipPermissionRequest() {
        if (!vm) return false;
        if (!vm.runtime) return false;
        return vm.runtime.isProjectPermissionManagerDisabled === true;
    }

    static GenerateCode(length) {
        return Array.from(new Array(length).keys()).map(() => { return Math.round(Math.random() * 9) }).join(""); // generates something like 281964
    }
    static EditPromptForAcceptCheck(string) {
        return String(string).replace(/ /gmi, "").toLowerCase();
    }
    static RequestPermission(name, ...args) {
        // packager
        if (ProjectPermissionManager.skipPermissionRequest === true) return true;

        if (ProjectPermissionManager.disabledPermissions.includes(name)) return false;

        if (name == "limitedWebsite") {
            if (args.length < 1) throw new Error("No URL specified what are you trying to get permission for bro");
            if (!ProjectPermissionManager.IsUrlSafe(args[0])) return false;
        };

        // check if we already gave permission to do this
        if (name == "limitedWebsite") {
            if (ProjectPermissionManager.permissions.limitedWebsites[args[0]] == true) return true;
        };
        if (ProjectPermissionManager.permissions[name]) return true;

        let string = `Allow this project to ${ProjectPermissionManager.permissionMessages[name]}?`;
        for (let i = 0; i < args.length; i++) {
            const argument = args[i];
            string = string.replace(`$${i}`, (ProjectPermissionManager.IsDataUrl(argument) ? "custom website" : String(argument)));
        }

        string += `\n\nThis will allow the project to:\n`;
        ProjectPermissionManager.permissionDrawbacks[name].forEach(drawback => {
            string += `▪ ${drawback}\n`;
        });
        let acceptCode = "ok";
        if (ProjectPermissionManager.requiresCode.includes(name)) {
            acceptCode = ProjectPermissionManager.GenerateCode(6);
        };
        string += `\nType "${acceptCode}" to allow, or type "stop" to never ask for this permission again.`;

        const allow = ProjectPermissionManager.EditPromptForAcceptCheck(prompt(string, ""));
        if (allow == "stop") {
            // yes this does intentionally disable asking for any specific website after one was rejected
            ProjectPermissionManager.disabledPermissions.push(name);
            return false;
        }
        const allowed = allow === String(acceptCode);
        if (name == "limitedWebsite") {
            if (!allowed) return false;
            ProjectPermissionManager.permissions.limitedWebsites[args[0]] = true;
            return true;
        };
        ProjectPermissionManager.permissions[name] = allowed;
        return allowed;
    };
    static RequestAllPermissions() {
        // packager
        if (ProjectPermissionManager.skipPermissionRequest === true) return true;

        if (ProjectPermissionManager.disabledPermissions.includes("all")) return false;
        const permissions = [];
        Object.getOwnPropertyNames(ProjectPermissionManager.permissions).forEach(permissionName => {
            if (typeof ProjectPermissionManager.permissions[permissionName] != "boolean") return;
            permissions.push(permissionName);
        });

        let string = `Give all permissions to this project?`;

        string += `\n\nThis will allow the project to:\n`;
        permissions.forEach(permissionName => {
            ProjectPermissionManager.permissionDrawbacks[permissionName].forEach(drawback => {
                string += `▪ ${drawback}\n`;
            });
        });
        const acceptCode = ProjectPermissionManager.GenerateCode(8);
        string += `\nType "${acceptCode}" to allow, or type "stop" to never ask for all permissions again.`;

        const allow = ProjectPermissionManager.EditPromptForAcceptCheck(prompt(string, ""));
        if (allow == "stop") {
            ProjectPermissionManager.disabledPermissions.push("all");
            return false;
        }
        const allowed = allow === String(acceptCode);
        if (!allowed) return false;
        Object.getOwnPropertyNames(ProjectPermissionManager.permissions).forEach(permissionName => {
            if (typeof ProjectPermissionManager.permissions[permissionName] != "boolean") return;
            ProjectPermissionManager.permissions[permissionName] = true;
        });
        return true;
    }
    static CanCreateURLObject(url) {
        let success = true;
        try {
            new URL(url);
        } catch {
            success = false;
        }
        return success;
    }
    static IsDataUrl(url) {
        // if its not a valid url
        // its probably not a data url
        if (!this.CanCreateURLObject(url)) return false;
        // create url object cuz ez to read
        const urlObject = new URL(url);
        // now we can just check the protocol
        return urlObject.protocol === 'data:';
    };
    static IsUrlSafe(url) { // checks for non-kid friendly urls because that would be a big stinker
        // we dont know what this is just say yup thas good
        if (!this.CanCreateURLObject(url)) return false;
        // custom urls cannot be checked yet, just say its safe for now
        if (ProjectPermissionManager.IsDataUrl(url)) return true;
        const urlObject = new URL(url);
        const origin = urlObject.origin.toLowerCase();
        // check origin for stuff
        let returningValue = true;
        // obviously this can be bypassed
        // but it blocks large or well-known sites
        // from working straight out of the gate
        // projects with these sites will not be approved anyways
        if (
            origin.includes("xxx")
            || origin.includes("adult")
            || origin.includes(atob("c2V4"))
            || origin.includes(atob("cG9ybg=="))
            || origin.includes(atob("Ym9vcnU="))
            || origin.includes(atob("aGVudGFp"))
        ) returningValue = false;
        // const mainName = link.match(/(?=(\.|\/\/))[^\n]+(?=(\.))/gmi)[0].replace(/(\/\/|)[^\n]+(?=(\.))/gmi, "").replace(/\/\//gmi, "")
        return returningValue;
    };
};

module.exports = ProjectPermissionManager;