import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppNavDrawer from './AppNavDrawer';
import AppBody from './AppBody';
import AppHeaderBar from './AppHeaderBar';

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    }
});

function AppLayout ({ classes, children }) {
    return (
        <div className={classes.root}>
            <AppHeaderBar/>
            <AppNavDrawer/>
            <AppBody>
                {children}
            </AppBody>
        </div>
    );
}

export default withStyles(styles)(AppLayout);
