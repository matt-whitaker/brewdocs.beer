import React from 'react';
import {Create} from '@material-ui/icons';
import {Link} from 'react-router-dom';
import {Card, CardActions, CardContent, CardMedia, Button, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    card: {
        margin: theme.spacing.unit
    },
    editButtonIcon: {
        marginRight: theme.spacing.unit
    }
});

function RecipeCard({ classes, recipe }) {
    return (
        <Card className={classes.card}>
            <CardContent>
                <Typography gutterBottom variant="headline" component="h2">
                    {recipe.name}
                </Typography>
                <Typography component="p">
                    {recipe.description}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small"
                        color="primary"
                        component={Link}
                        to={`/recipe/${recipe.id}`}>
                    <Create className={classes.editButtonIcon} />Edit
                </Button>
            </CardActions>
        </Card>
    );
}

export default withStyles(styles)(RecipeCard);
