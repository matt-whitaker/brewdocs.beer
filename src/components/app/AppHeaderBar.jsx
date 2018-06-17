import React from 'react';
import {AppBar, Toolbar, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';

function AppHeaderBar ({ classes }) {
    return (
        <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
                <Typography variant="title" color="inherit" noWrap>
                    BrewNotes
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default withStyles(styles)(AppHeaderBar);
