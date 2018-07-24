import React from 'react';
import {MemoryRouter} from 'react-router';

export default function AppRouter({children}) {
    return <MemoryRouter>{children}</MemoryRouter>;
}