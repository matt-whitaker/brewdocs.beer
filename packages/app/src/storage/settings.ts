import {Forage} from "@/storage/forage";
import localforage from "localforage";

/**
 * Track visual toggles throughout the app as the user interacts to keep a memory of things like collapses or tabs
 */
export class SettingsStorage extends Forage<boolean>{
    constructor() {
        super("settings");
    }
}

const settingsStorage = new SettingsStorage();
export default settingsStorage;