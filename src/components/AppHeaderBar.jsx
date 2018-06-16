import React from 'react';
import {AppBar, Toolbar, Typography} from '@material-ui/core';

export default function AppHeaderBar ({ classes }) {
    return (
        <AppBar position="absolute" className={classes.appBar}>
            <Toolbar>
                <Typography variant="title" color="inherit" noWrap>
                    Clipped drawer
                </Typography>
            </Toolbar>
        </AppBar>
    );
}