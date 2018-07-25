import adapter from '../utils/rest';
import serviceUtils from '../utils/service';

const getRecipes = adapter.get('recipes');
const createRecipe = adapter.create('recipes');

export default {
    get: () => getRecipes()
        .then(serviceUtils.indexModel)
        .then(serviceUtils.createMap),

    create: (recipe) => createRecipe(recipe)
}