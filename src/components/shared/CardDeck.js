import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';

function CardDeck ({classes, children}) {
    return <div className={classes.cardDeck}>{children}</div>
}

export default withStyles(styles)(CardDeck);
