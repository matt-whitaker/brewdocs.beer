import request from 'superagent';
import error from './error';

const baseUrl = process.env.API_URL || '';
const notImplemented = error('NotImplemented');

const getResource = (resource) => () => request
    .get(`${baseUrl}/${resource}`);

const createResource = (resource) => (data) => Promise.reject(notImplemented());

export default {
    get: getResource,
    create: createResource
}