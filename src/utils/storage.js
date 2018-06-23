import Promise from 'bluebird';
// import error from './error';

export class KeyMissError extends Error {
    constructor(message) {
        super(message);
        this.name = 'KeyMissError';
    }

    static get name () { return 'KeyMissError' }
}

const keyMissError = (key) => Promise.reject(new KeyMissError(`'${key}' not found.`));

export default {
    get (key) {
        return Promise
            .resolve(localStorage.getItem(key))
            .tap((_) => console.log(typeof _, _))
            .then((data) => !data ? keyMissError(key) : JSON.parse(data))
    },

    set (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return this.get(key);
    }
};