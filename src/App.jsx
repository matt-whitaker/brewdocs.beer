import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router';
import { Provider } from 'react-redux';
import AppLayout from './components/app/AppLayout';
import Routes from './Routes';
import Store from './dux';

import './less/app.less';

export default function App () {
    return (
        <Provider store={Store}>
            <MemoryRouter>
                <AppLayout>
                    <Routes/>
                </AppLayout>
            </MemoryRouter>
        </Provider>
    );
}

ReactDOM.render(<App/>, document.getElementById('app'));
