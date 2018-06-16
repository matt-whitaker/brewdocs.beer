import React from 'react';
import {Drawer, List, Divider} from '@material-ui/core';

export default function AppNavDrawer ({ classes }) {
    return (
        <Drawer variant="permanent" classes={{paper: classes.drawerPaper}}>
            <div className={classes.toolbar} />
            <List>{[]}</List>
            <Divider />
            <List>{[]}</List>
        </Drawer>
    );
}
