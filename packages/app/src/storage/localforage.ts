import localforage from "localforage";
import sessionStorageDriver from "localforage-sessionstoragewrapper";
import queryStorageDriver from "@/storage/queryStorageDriver";

export const LF_INDEXEDDB = localforage.INDEXEDDB;
export const LF_WEBSQL = localforage.WEBSQL;
export const LF_LOCALSTORAGE = localforage.LOCALSTORAGE;
export const LF_SESSIONSTORAGE = sessionStorageDriver._driver
export const LF_QUERYSTORAGE = queryStorageDriver._driver

localforage.defineDriver(sessionStorageDriver);
localforage.defineDriver(queryStorageDriver);

export default localforage;