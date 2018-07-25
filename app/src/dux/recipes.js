import Promise from 'bluebird';
import recipes from '../services/recipes';

export const LOAD_RECIPES = 'LOAD_RECIPES';
export const LOAD_RECIPES_SUCCESS = 'LOAD_RECIPES_SUCCESS';
export const LOAD_RECIPES_ERROR = 'LOAD_RECIPES_ERROR';

export const CREATE_RECIPE = 'CREATE_RECIPE';
export const CREATE_RECIPE_SUCCESS = 'CREATE_RECIPE_SUCCESS';
export const CREATE_RECIPE_ERROR = 'CREATE_RECIPE_ERROR';

export default function (state = null, { type, data }) {
    switch (type) {
        case LOAD_RECIPES_SUCCESS:
        case CREATE_RECIPE_SUCCESS:
            state = data;
            break;
    }

    return state;
};

export function loadRecipes () {
    return (dispatch, getState) => {
        if (!getState().recipes) {
            dispatch({ type: LOAD_RECIPES });

            recipes.get()
                .then((data) => dispatch({data, type: LOAD_RECIPES_SUCCESS}))
                .catch((error) => dispatch({error, type: LOAD_RECIPES_ERROR}));
        }
    };
}

export function createRecipe (recipe) {
    return (dispatch) => {
        dispatch({ type: CREATE_RECIPE });

        recipes.create(recipe)
            .then((data) => dispatch({data, type: CREATE_RECIPE_SUCCESS}))
            .catch((error) => dispatch({error, type: CREATE_RECIPE_ERROR}));
    };
}