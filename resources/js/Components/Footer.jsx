import React from 'react';
import { Link } from '@inertiajs/react';


const Footer = () => {
    return (
        <footer className="bg-black px-4 py-16 mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-400">
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">About Alpha</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Jobs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Account</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Manage Profiles</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Transfer Profile</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Gift Cards</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Media Center</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">Media Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Alpha.</p>
                    </div>
                </div>
            </footer>
    )
}
export default Footer;