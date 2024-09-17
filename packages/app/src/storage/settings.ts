import {Forage} from "@/storage/forage";
import {LF_SESSIONSTORAGE} from "@/utils/localforage";

/**
 * Track visual toggles throughout the app as the user interacts to keep a memory of things like collapses or tabs
 */
export class SettingsStorage extends Forage<boolean>{
    constructor() {
        super("settings", LF_SESSIONSTORAGE);
    }
}

const settingsStorage = new SettingsStorage();
export default settingsStorage;