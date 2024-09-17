import {Forage} from "@/storage/forage";
import {LF_SESSIONSTORAGE} from "@/utils/localforage";

/**
 * Track visual toggles throughout the app as the user interacts to keep a memory of things like collapses or tabs
 */
export class SessionStorage extends Forage<boolean>{
    constructor() {
        super("session", LF_SESSIONSTORAGE);
    }
}

const sessionStorage = new SessionStorage();
export default sessionStorage;