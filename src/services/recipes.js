import {ifElse, indentity} from 'ramda';
import storage, {KeyMissError} from '../utils/storage';

const stubData = process.env.STUB_DATA && process.env.STUB_DATA.includes('recipes')
    ? require('../../data/recipes.json')
    : [];

export default {
    get () {
        return storage.get('recipes')
            .catch({name: KeyMissError.name}, () => [])
            .then((data) => new Map([...stubData, ...data]))
    },

    create () {
        return this.get()
            .then((data) => storage.set('recipes', data.set(recipe.id, recipe).entries()))
            .then((data) => new Map(data))
    }
}