import storage, {KeyMissError} from '../utils/storage';

export default {
    get () {
        return storage.get('recipes')
            .catch({name: KeyMissError.name}, () => [])
            .then((data) => new Map(data))
    },

    create () {
        return getRecipes()
            .then((data) => storage.set('recipes', data.set(recipe.id, recipe).entries()))
            .then((data) => new Map(data))
    }
}