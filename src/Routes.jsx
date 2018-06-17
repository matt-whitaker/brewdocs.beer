import React from 'react';
import { Route } from 'react-router'
import Home from './containers/pages/Home';

export default function Routes () {
    return (
        <div>
            <Route exact path="/" component={Home} />
        </div>
    );
}