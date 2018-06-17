import React from 'react';
import {Link} from 'react-router-dom';
import {Drawer, List, ListItem, ListItemIcon, ListItemText, Divider} from '@material-ui/core';
import {Home} from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import styles from '../../jss/styles';

function AppNavDrawer ({ classes }) {
    return (
        <Drawer variant="permanent" classes={{paper: classes.drawerPaper}}>
            <div className={classes.toolbar} />
            <List>
                <ListItem button component={Link} to="/">
                    <ListItemIcon>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
            </List>
            {/*<Divider />*/}
            {/*<List>{[]}</List>*/}
        </Drawer>
    );
}

export default withStyles(styles)(AppNavDrawer);
