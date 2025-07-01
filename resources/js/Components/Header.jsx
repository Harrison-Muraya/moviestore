import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';
import AlphaLogo from './AlphaLogo';

const Header = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent px-4 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    {/* <h1 className="text-2xl md:text-3xl font-bold text-red-600 tracking-wider">ALPHA</h1> */}
                    <AlphaLogo />
                    <nav className="hidden md:flex gap-6">
                        <Link href={route('latestdashboard')} className="text-white hover:text-gray-300 transition-colors">Home</Link>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
                        <Link href={route('movieList')} className="text-white hover:text-gray-300 transition-colors">Movies</Link>
                        <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
                        <Link href={route('movieList')} className="text-white hover:text-gray-300 transition-colors">My List</Link>
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