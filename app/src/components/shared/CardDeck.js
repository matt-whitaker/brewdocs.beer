import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    cardDeck: {
        display: 'flex',
        justifyContent: 'center'
    }
});

function CardDeck ({classes, children}) {
    return <div className={classes.cardDeck}>{children}</div>
}

export default withStyles(styles)(CardDeck);
