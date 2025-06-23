import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent px-4 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    <h1 className="text-red-600 text-3xl font-bold">NETFLIX</h1>
                    <nav className="hidden md:flex gap-6">
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Search className="w-6 h-6 cursor-pointer hover:text-gray-300 transition-colors" />
                    <Bell className="w-6 h-6 cursor-pointer hover:text-gray-300 transition-colors" />
                    <User className="w-8 h-8 bg-red-600 rounded p-1 cursor-pointer hover:bg-red-700 transition-colors" />
                </div>
            </div>
        </header>
    )
}
export default Header;