import React from 'react';
import {when, map} from 'ramda';
import {Button, Typography} from '@material-ui/core';
import {Add} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';
import RecipeCard from '../../components/shared/RecipeCard';
import CardDeck from '../../components/shared/CardDeck';

class Home extends React.Component {
    componentDidMount () {
        this.props.loadRecipes();
    }

    render () {
        const {recipes, classes} = this.props;

        if (!recipes) return 'Loading...';

        const renderCard = (recipe) => <RecipeCard recipe={recipe}/>;

        return (
            <div>
                <Typography className={classes.createButton} variant="headline" component="h1">
                    Recent Recipes
                </Typography>
                <CardDeck children={[...recipes.values()].map(renderCard)}/>
                <Button className={classes.createButton}>
                    <Add className={classes.createButtonIcon}/>New Recipe
                </Button>
            </div>
        );
    }
}

export default withStyles(styles)(Home);