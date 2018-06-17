import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';
// import AppHeaderBar from '../../components/app/AppHeaderBar';
import AppNavDrawer from './AppNavDrawer';
import AppBody from './AppBody';
import AppHeaderBar from './AppHeaderBar'

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
