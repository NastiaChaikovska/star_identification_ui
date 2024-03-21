import React from 'react';
import Menu from './Menu';

const Layout = ({ showMenu, title, children }) => {
    return (
        <div className="title" style={{ position: 'relative', textAlign: 'center' }}>
            <h1 style={{ margin: '0' }}>{title}</h1>
            {showMenu && <Menu />}
            {children}
        </div>
    );
};

export default Layout;
