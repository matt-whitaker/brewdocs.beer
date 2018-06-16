import React from 'react';
import ReactDOM from 'react-dom';
import Include from './Include.jsx';
import './../less/app.less';

export default function App () {
    return <Include/>;
}

ReactDOM.render(<App/>, document.getElementById('app'));