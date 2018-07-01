import storage from '../utils/storage';

const updateData = (recipe) => (data) => [...data.set(recipe.id, recipe).entries()];
const saveData = (data) => storage.set('recipes', data);
const indexRecipes = (recipes) => recipes.map((recipe) => [recipe.id, recipe]);

export default {
    get () {
        return storage.get('recipes')
            .then(indexRecipes)
            .then((data) => new Map(data));
    },

    create (recipe) {
        return this.get()
            .then(updateData(recipe))
            .tap(saveData);
    }
}