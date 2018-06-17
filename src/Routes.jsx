import React from 'react';
import { Route } from 'react-router'
import Home from './containers/pages/Home';
import Recipe from './containers/pages/Recipe';

export default function Routes () {
    return [
        <Route exact path="/" component={Home} />,
        <Route path="/recipe/:recipeId" component={Recipe}/>
    ];
}