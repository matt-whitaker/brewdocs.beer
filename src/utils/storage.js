import path from 'path';
import Promise from 'bluebird';
const fs = require('fs');
// import error from './error';

const base = process.env.JSON_SRC;

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

export class KeyMissError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KeyMissError';
    }

    static get name () { return 'KeyMissError' }
}

const keyMissError = (key) => Promise.reject(new KeyMissError(`'${key}' not found.`));
const getPath = (key) => path.resolve(process.cwd(), base, `${key}.json`);

export default {
    get (key) {
        return Promise.resolve(readFile(getPath(key)))
            .then((dataStr) => !dataStr ? keyMissError(key) : JSON.parse(dataStr))
    },

    set (key, value) {
        return Promise.resolve(value)
            .then(JSON.stringify)
            .tap((dataStr) => writeFile(getPath, dataStr));
    }
};