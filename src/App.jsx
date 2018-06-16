import React from 'react';
import ReactDOM from 'react-dom';
import AppLayout from './containers/AppLayout';
import Routes from './Routes';

export default function App () {
    return <AppLayout><Routes/></AppLayout>;
}

ReactDOM.render(<App/>, document.getElementById('app'));
