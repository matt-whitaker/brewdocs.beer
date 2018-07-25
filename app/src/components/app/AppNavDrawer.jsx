import React from 'react';
import {Drawer} from '@material-ui/core';
import AppNavDrawerList from './AppNavDrawerList';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    drawerPaper: {
        position: 'relative',
        width: 240
    },
    spacer: theme.mixins.toolbar
});

function AppNavDrawer ({ classes }) {
    return (
        <Drawer variant="permanent" classes={{paper: classes.drawerPaper}}>
            <div className={classes.spacer} />
            <AppNavDrawerList/>
            {/*<Divider />*/}
            {/*<List>{[]}</List>*/}
        </Drawer>
    );
}

export default withStyles(styles)(AppNavDrawer);
