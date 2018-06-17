import React from 'react';
import AppHeaderBar from '../../containers/app/AppHeaderBar';
import AppNavDrawer from '../../containers/app/AppNavDrawer';
import AppBody from '../../containers/app/AppBody';

export default function AppLayout ({ classes, children }) {
    return (
        <div className={classes.root}>
            {/*<AppHeaderBar/>*/}
            <AppNavDrawer/>
            <AppBody>
                {children}
            </AppBody>
        </div>
    );
}