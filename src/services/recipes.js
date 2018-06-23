import {ifElse, indentity} from 'ramda';
import storage, {KeyMissError} from '../utils/storage';

export default {
    get () {
        return storage.get('recipes')
            .catch({name: KeyMissError.name}, () => {
                return [];
            })
            .then((data) => (new Map(data)))
    },

    create (recipe) {
        return this.get()
            .then((data) => storage.set('recipes', [...data.set(recipe.id, recipe).entries()]))
            .then((data) => (new Map(data)))
    }
}