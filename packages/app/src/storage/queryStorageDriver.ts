

interface QueryParamStore {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    key(index: number): string | null;
    readonly length: number;
}

interface QueryDbInfo extends LocalForageOptions {
    db: QueryParamStore;
    keyPrefix: string;
    serializer: LocalForageSerializer;
}

interface QueryDriverContext {
    ready(): Promise<void>;
    getSerializer(): Promise<LocalForageSerializer>;
    _defaultConfig?: { storeName?: string };
    _dbInfo: QueryDbInfo;
}

const DRIVER_NAME = "queryStorageWrapper";
const DEFAULT_STORE_NAME = "keyvaluepairs";

function readParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
}

function writeParams(params: URLSearchParams): void {
    const search = params.toString();
    const url = window.location.pathname + (search ? `?${search}` : "") + window.location.hash;
    window.history.replaceState(window.history.state, "", url);
}

function paramKeys(params: URLSearchParams): string[] {
    return [...new Set(params.keys())];
}

const queryParamStore: QueryParamStore = {
    getItem(key) {
        return readParams().get(key);
    },
    setItem(key, value) {
        const params = readParams();
        params.set(key, value);
        writeParams(params);
    },
    removeItem(key) {
        const params = readParams();
        params.delete(key);
        writeParams(params);
    },
    key(index) {
        return paramKeys(readParams())[index] ?? null;
    },
    get length() {
        return paramKeys(readParams()).length;
    }
};

function isQueryStorageValid(): boolean {
    try {
        return typeof window !== "undefined"
            && !!window.history
            && typeof window.history.replaceState === "function"
            && typeof URLSearchParams !== "undefined";
    } catch {
        return false;
    }
}

function normalizeKey(key: string): string {
    if (typeof key !== "string") {
        console.warn(`${key} used as a key, but it is not a string.`);
        key = String(key);
    }
    return key;
}

function getKeyPrefix(options: LocalForageOptions, defaultStoreName: string): string {
    let keyPrefix = `${options.name}/`;
    if (options.storeName && options.storeName !== defaultStoreName) {
        keyPrefix += `${options.storeName}/`;
    }
    return keyPrefix;
}

function getCallback(...args: unknown[]): ((...cbArgs: unknown[]) => void) | undefined {
    const last = args[args.length - 1];
    return typeof last === "function" ? (last as (...cbArgs: unknown[]) => void) : undefined;
}

function executeCallback<T>(promise: Promise<T>, callback?: (err: unknown, result: T) => void): Promise<T> {
    if (callback) {
        promise.then(
            result => callback(null, result),
            error => callback(error, undefined as unknown as T)
        );
    }
    return promise;
}

function initStorage(this: QueryDriverContext, options: LocalForageOptions): Promise<void> {
    const defaultStoreName = this._defaultConfig?.storeName ?? DEFAULT_STORE_NAME;
    const dbInfo = {
        ...options,
        db: queryParamStore,
        keyPrefix: getKeyPrefix(options, defaultStoreName)
    } as QueryDbInfo;
    this._dbInfo = dbInfo;
    return this.getSerializer().then(serializer => {
        dbInfo.serializer = serializer;
    });
}

function getItem<T>(this: QueryDriverContext, key: string, callback?: (err: unknown, value: T | null) => void): Promise<T | null> {
    key = normalizeKey(key);
    const promise = this.ready().then(() => {
        const { db, keyPrefix, serializer } = this._dbInfo;
        const result = db.getItem(keyPrefix + key);
        return result == null ? null : serializer.deserialize<T>(result) as T;
    });
    executeCallback(promise, callback);
    return promise;
}

function setItem<T>(this: QueryDriverContext, key: string, value: T, callback?: (err: unknown, value: T) => void): Promise<T> {
    key = normalizeKey(key);
    const promise = this.ready().then(() => {
        const { db, keyPrefix, serializer } = this._dbInfo;
        const original = (value === undefined ? null : value) as T;
        return new Promise<T>((resolve, reject) => {
            serializer.serialize(original, (serialized, error) => {
                if (error) {
                    reject(error);
                    return;
                }
                try {
                    db.setItem(keyPrefix + key, serialized);
                    resolve(original);
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
    executeCallback(promise, callback);
    return promise;
}

function removeItem(this: QueryDriverContext, key: string, callback?: (err: unknown) => void): Promise<void> {
    key = normalizeKey(key);
    const promise = this.ready().then(() => {
        const { db, keyPrefix } = this._dbInfo;
        db.removeItem(keyPrefix + key);
    });
    executeCallback(promise, callback);
    return promise;
}

function clear(this: QueryDriverContext, callback?: (err: unknown) => void): Promise<void> {
    const promise = this.ready().then(() => {
        const { db, keyPrefix } = this._dbInfo;

        for (let i = db.length - 1; i >= 0; i--) {
            const key = db.key(i) || "";
            if (key.indexOf(keyPrefix) === 0) {
                db.removeItem(key);
            }
        }
    });
    executeCallback(promise, callback);
    return promise;
}

function getKeys(this: QueryDriverContext, callback?: (err: unknown, keys: string[]) => void): Promise<string[]> {
    const promise = this.ready().then(() => {
        const { db, keyPrefix } = this._dbInfo;
        const keys: string[] = [];
        for (let i = 0; i < db.length; i++) {
            const itemKey = db.key(i) || "";
            if (itemKey.indexOf(keyPrefix) === 0) {
                keys.push(itemKey.substring(keyPrefix.length));
            }
        }
        return keys;
    });
    executeCallback(promise, callback);
    return promise;
}

function getKey(this: QueryDriverContext, keyIndex: number, callback?: (err: unknown, key: string | null) => void): Promise<string | null> {
    const promise = this.ready().then(() => {
        const { db, keyPrefix } = this._dbInfo;
        const result = db.key(keyIndex);
        return result == null ? null : result.substring(keyPrefix.length);
    });
    executeCallback(promise, callback);
    return promise;
}

function getLength(this: QueryDriverContext, callback?: (err: unknown, length: number) => void): Promise<number> {
    const promise = getKeys.call(this).then(keys => keys.length);
    executeCallback(promise, callback);
    return promise;
}

function iterate<T, U>(
    this: QueryDriverContext,
    iterator: (value: T, key: string, iterationNumber: number) => U,
    callback?: (err: unknown, result: U | undefined) => void
): Promise<U | undefined> {
    const promise = this.ready().then(() => {
        const { db, keyPrefix, serializer } = this._dbInfo;
        const keyPrefixLength = keyPrefix.length;
        let iterationNumber = 1;
        for (let i = 0; i < db.length; i++) {
            const key = db.key(i) || "";
            if (key.indexOf(keyPrefix) !== 0) {
                continue;
            }
            const raw = db.getItem(key);
            const value = raw == null ? null : (serializer.deserialize<T>(raw) as T);
            const result = iterator(value as T, key.substring(keyPrefixLength), iterationNumber++);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    });
    executeCallback(promise, callback);
    return promise;
}

function dropInstance(this: QueryDriverContext, ...args: unknown[]): Promise<void> {
    const callback = getCallback(...args);
    const promise = clear.call(this);
    executeCallback(promise, callback);
    return promise;
}

const queryStorageDriver = {
    _driver: DRIVER_NAME,
    _support: isQueryStorageValid(),
    _initStorage: initStorage,
    getItem,
    setItem,
    removeItem,
    clear,
    length: getLength,
    key: getKey,
    keys: getKeys,
    iterate,
    dropInstance
} as unknown as LocalForageDriver;

export default queryStorageDriver;
