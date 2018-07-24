import request from 'superagent';
import error from './error';

const baseUrl = process.env.API_URL || '';
const notImplemented = error('NotImplemented');

const getResource = (resource) => () => request
    .get(`${baseUrl}/${resource}`)
    .set('Accept', 'application/json');

const createResource = (resource) => (data) => request
    .post(`${baseUrl}/${resource}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(data)
;

export default {
    get: getResource,
    create: createResource
}