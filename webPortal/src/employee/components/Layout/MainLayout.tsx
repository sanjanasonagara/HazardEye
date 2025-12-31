import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
                <div className="max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
