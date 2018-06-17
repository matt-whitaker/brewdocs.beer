import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import AppLayout from './components/app/AppLayout';
import Routes from './Routes';
import Store from './dux';

import './less/app.less';

export default function App () {
    return (
        <Provider store={Store}>
            <AppLayout>
                <Routes/>
            </AppLayout>
        </Provider>
    );
}

ReactDOM.render(<App/>, document.getElementById('app'));
