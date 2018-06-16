import React from 'react';

export default function ({ classes, children }) {
    return (
        <main className={classes.content}>
            <div className={classes.toolbar} />
            {children}
        </main>
    );
}