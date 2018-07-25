import React from 'react';
import {Link} from 'react-router-dom';
import {Button, Typography} from '@material-ui/core';
import {Add} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import RecipeCard from '../shared/RecipeCard';
import CardDeck from '../../components/shared/CardDeck';

const styles = (theme) => ({
    createButton: {
        margin: theme.spacing.unit
    },
    createButtonIcon: {
        marginRight: theme.spacing.unit
    }
});

class Home extends React.Component {
    componentDidMount () {
        this.props.loadRecipes();
    }

    render () {
        const {recipes, classes} = this.props;

        if (!recipes) return 'Loading...';

        const renderCard = (recipe) => <RecipeCard key={recipe.id} recipe={recipe}/>;

        return (
            <div>
                <Typography className={classes.createButton} variant="headline" component="h1">
                    Recent Recipes
                </Typography>
                <CardDeck children={[...recipes.values()].map(renderCard)}/>
                <Button className={classes.createButton} component={Link} to="/recipe/new">
                    <Add className={classes.createButtonIcon}/>New Recipe
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(Home);