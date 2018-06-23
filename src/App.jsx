import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router';
import { Provider } from 'react-redux';
import AppLayout from './components/app/AppLayout';
import AppWrapper from './components/app/AppWrapper';
import Routes from './Routes';
import Store from './dux';

import './less/app.less';

export default function App () {
    return (
        <Provider store={Store}>
            <MemoryRouter>
                <AppWrapper>
                    <AppLayout>
                        <Routes/>
                    </AppLayout>
                </AppWrapper>
            </MemoryRouter>
        </Provider>
    );
}

ReactDOM.render(<App/>, document.getElementById('app'));
