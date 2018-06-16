import React from 'react';
import { MemoryRouter, Route } from 'react-router'
import Page1 from './components/Page1';
import Page2 from './components/Page2';

export default function Routes () {
    return (
        <MemoryRouter>
            <div>
                <Route exact path="/" component={Page1} />
                <Route path="/page2" component={Page2} />
            </div>
        </MemoryRouter>
    );
}