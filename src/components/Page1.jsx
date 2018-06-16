import React from 'react';
import { Link } from 'react-router-dom';
export default function Page1 () {
    return [
        <h1>Page 1</h1>,
        <Link to="/page2">Page2</Link>
    ];
}