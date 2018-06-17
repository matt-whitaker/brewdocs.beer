import React from 'react';
import { MemoryRouter, Route } from 'react-router'
import Home from './containers/pages/Home';

export default function Routes () {
    return (
        <MemoryRouter>
            <div>
                <Route exact path="/" component={Home} />
            </div>
        </MemoryRouter>
    );
}