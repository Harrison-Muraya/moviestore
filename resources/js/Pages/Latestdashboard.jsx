import React, { useState, useRef, useEffect } from 'react';
import MovieCard from "@/Components/MovieCard"
import MovieRow from "@/Components/MovieRow";
import Hero from "@/Components/Hero";
import { Play, Info, ChevronLeft, ChevronRight, Search, Bell, User, Volume2, VolumeX } from 'lucide-react';

const AlphaMovies = () => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);
    const rowRefs = useRef({});

    useEffect(() => {
        // Auto-play video when component mounts
        if (videoRef.current) {
            videoRef.current.play().catch(err => {
                console.log("Auto-play was prevented:", err);
            });
        }
    }, []);

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // Mock data for movies/shows
    const heroContent = {
        title: "Stranger Things",
        description: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    const movieCategories = [
        {
            title: "Trending Now",
            movies: [
                { id: 1, title: "The Crown", image: "https://images.unsplash.com/photo-1489599735734-79b1df2ebeeb?w=300&h=450&fit=crop" },
                { id: 2, title: "Ozark", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop" },
                { id: 3, title: "The Witcher", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" },
                { id: 4, title: "Bridgerton", image: "https://images.unsplash.com/photo-1594736797933-d0db3ac3295d?w=300&h=450&fit=crop" },
                { id: 5, title: "Money Heist", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop" },
                { id: 6, title: "Dark", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop" }
            ]
        },
        {
            title: "Netflix Originals",
            movies: [
                { id: 7, title: "House of Cards", image: "https://images.unsplash.com/photo-1489599735734-79b1df2ebeeb?w=300&h=450&fit=crop" },
                { id: 8, title: "Orange Is the New Black", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" },
                { id: 9, title: "Narcos", image: "https://images.unsplash.com/photo-1594736797933-d0db3ac3295d?w=300&h=450&fit=crop" },
                { id: 10, title: "The Umbrella Academy", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop" },
                { id: 11, title: "Squid Game", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop" },
                { id: 12, title: "Wednesday", image: "https://images.unsplash.com/photo-1489599735734-79b1df2ebeeb?w=300&h=450&fit=crop" }
            ]
        },
        {
            title: "Action & Adventure",
            movies: [
                { id: 13, title: "Extraction", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" },
                { id: 14, title: "6 Underground", image: "https://images.unsplash.com/photo-1594736797933-d0db3ac3295d?w=300&h=450&fit=crop" },
                { id: 15, title: "The Old Guard", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop" },
                { id: 16, title: "Triple Frontier", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop" },
                { id: 17, title: "Bird Box", image: "https://images.unsplash.com/photo-1489599735734-79b1df2ebeeb?w=300&h=450&fit=crop" },
                { id: 18, title: "The Platform", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" }
            ]
        }
    ];


    const scroll = (direction, rowIndex) => {
        const rowRef = rowRefs.current[rowIndex];
        if (rowRef) {
            const scrollAmount = 300;
            const currentScroll = rowRef.scrollLeft;
            const newPosition = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;

            rowRef.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Header */}
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

            {/* Hero Section */}
            <Hero />
            {/* Movie Rows */}

            <main className="relative z-10 -mt-32">
                {movieCategories.map((category, index) => (
                    <MovieRow key={index} category={category} rowIndex={index} />
                ))}
            </main>

            {/* Footer */}
            <footer className="bg-black px-4 py-16 mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-gray-400">
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-white transition-colors">About Netflix</a></li>
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
                        <p>&copy; 2025 Netflix Clone. This is a demo interface.</p>
                    </div>
                </div>
            </footer>

            <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

export default AlphaMovies;