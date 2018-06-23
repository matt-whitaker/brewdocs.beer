import React from 'react';
import {Card, CardActions, CardContent, CardMedia, Button, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    card: {
        margin: theme.spacing.unit
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
                {/*<Button size="small" color="primary">*/}
                    {/*View*/}
                {/*</Button>*/}
                <Button size="small" color="primary">
                    Edit
                </Button>
            </CardActions>
        </Card>
    );
}

export default withStyles(styles)(RecipeCard);
