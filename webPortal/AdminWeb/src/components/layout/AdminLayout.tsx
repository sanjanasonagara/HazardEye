import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const AdminLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: 'var(--color-bg-body)' }}>
            <Header />
            <main style={{ flex: 1, padding: '2rem', maxWidth: '1700px', margin: '0 auto', width: '100%' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
