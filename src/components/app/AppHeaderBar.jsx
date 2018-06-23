import React from 'react';
import {AppBar, Toolbar, Typography} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    headerBar: {
        zIndex: theme.zIndex.drawer + 1,
    }
});

function AppHeaderBar ({ classes }) {
    return (
        <AppBar position="absolute" className={classes.headerBar}>
            <Toolbar>
                <Typography variant="title" color="inherit" noWrap>
                    BrewNotes
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default withStyles(styles)(AppHeaderBar);
