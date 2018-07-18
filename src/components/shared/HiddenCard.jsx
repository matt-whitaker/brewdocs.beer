import React from 'react';
import {Card} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    card: {
        margin: theme.spacing.unit,
        flexGrow: 1,
        flexBasis: '30%',
        visibility: 'hidden'
    }
});

function HiddenCard({ classes }) {
    return (
        <Card className={classes.card}/>
    );
}

export default withStyles(styles)(HiddenCard);
