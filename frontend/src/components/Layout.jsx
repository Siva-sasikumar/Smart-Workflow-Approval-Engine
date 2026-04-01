import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
    return (
        <div className="bg-[#F3F4F6] min-h-screen text-gray-900 font-sans antialiased flex overflow-hidden">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col sm:ml-64 min-h-screen transition-all duration-300">
                <Navbar role={role} />
                <main className="flex-1 w-full pt-28 px-4 sm:px-8 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    <div className="relative h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
