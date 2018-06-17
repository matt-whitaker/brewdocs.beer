import React from 'react';
import {Drawer, List, Divider} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';

function AppNavDrawer ({ classes }) {
    return (
        <Drawer variant="permanent" classes={{paper: classes.drawerPaper}}>
            {/*<div className={classes.toolbar} />*/}
            <List>{[]}</List>
            <Divider />
            <List>{[]}</List>
        </Drawer>
    );
}

export default withStyles(styles)(AppNavDrawer);
