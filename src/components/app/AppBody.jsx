import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';

function AppBody({ classes, children }) {
    return (
        <main className={classes.content}>
            <div className={classes.toolbar} />
            {children}
        </main>
    );
}

export default withStyles(styles)(AppBody);
