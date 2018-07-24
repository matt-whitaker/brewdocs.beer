import {connect} from 'react-redux';
import Recipe from '../../components/pages/Recipe';

import * as recipeActions from '../../dux/recipes';

const mapStateToProps = ({recipes}, {match}) => {
    const id = parseInt(match.params.recipeId, 10);

    return {
        recipe: id ? recipes.get(id) : null
    };
};

const actions = {...recipeActions};

export default connect(mapStateToProps, actions)(Recipe);