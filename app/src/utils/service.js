
const indexModel = (models) => models.map((model) => [model.id, model]);
const createMap = (index) => new Map(index);

export default {
    indexModel,
    createMap
}