import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0
    },
    spacer: theme.mixins.toolbar
});

function AppBody({ classes, children }) {
    return (
        <main className={classes.content}>
            <div className={classes.spacer} />
            {children}
        </main>
    );
}

export default withStyles(styles)(AppBody);
