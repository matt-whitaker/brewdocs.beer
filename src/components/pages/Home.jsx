import React from 'react';
import {when, map} from 'ramda';
import {Button} from '@material-ui/core';
import {Add} from '@material-ui/icons';
import RecipeCard from '../../containers/shared/RecipeCard';

export default class Home extends React.Component {
    componentDidMount () {
        this.props.loadRecipes();
    }

    render () {
        const { recipes } = this.props;

        if (!recipes) return 'Loading...';

        const renderCard = (recipe) => <RecipeCard recipe={recipe}/>;

        return (
            <div>
                <div>
                    {map(renderCard)(recipes.values())}
                </div>
                <div>
                    <Button><Add/> New Recipe</Button>
                </div>
            </div>
        );
    }
}