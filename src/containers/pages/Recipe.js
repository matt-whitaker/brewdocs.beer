import {connect} from 'react-redux';
import Recipe from '../../components/pages/Recipe';

import * as recipeActions from '../../dux/recipes';

const mapStateToProps = ({recipes}, {match}) => {
    const id = match.params.recipeId;
    return {
        recipe: id ? recipes.get(match.params.recipeId) : null
    };
};

const actions = {...recipeActions};

export default connect(mapStateToProps, actions)(Recipe);