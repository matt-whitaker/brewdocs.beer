import React from 'react';
import AppHeaderBar from '../containers/AppHeaderBar';
import AppNavDrawer from '../containers/AppNavDrawer';
import AppBody from '../containers/AppBody';

export default function AppLayout ({ classes, children }) {
    console.log("lksdjfs");
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