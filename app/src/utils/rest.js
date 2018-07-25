import request from 'superagent';

const baseUrl = process.env.API_URL || '/';

const getResource = (resource) => () => request
    .get(`${baseUrl}/${resource}`)
    .set('Accept', 'application/json')
    .ok(res => res.status < 400);

const createResource = (resource) => (data) => request
    .post(`${baseUrl}/${resource}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(data)
    .ok(res => res.status < 400)
;

export default {
    get: getResource,
    create: createResource
}