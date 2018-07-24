import React from 'react';
import {Link} from 'react-router-dom';
import {Home} from '@material-ui/icons';
import {List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';

export default function AppNavDrawerList () {
    return (
        <List>
            <ListItem button component={Link} to="/">
                <ListItemIcon>
                    <Home/>
                </ListItemIcon>
                <ListItemText primary="Home" />
            </ListItem>
        </List>
    );
}