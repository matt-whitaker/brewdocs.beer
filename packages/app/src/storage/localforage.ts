import localforage from "localforage";
import sessionStorageDriver from "localforage-sessionstoragewrapper";

export const LF_INDEXEDDB = localforage.INDEXEDDB;
export const LF_WEBSQL = localforage.WEBSQL;
export const LF_LOCALSTORAGE = localforage.LOCALSTORAGE;
export const LF_SESSIONSTORAGE = sessionStorageDriver._driver

localforage.defineDriver(sessionStorageDriver);

export default localforage;