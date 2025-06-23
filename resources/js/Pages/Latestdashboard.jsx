import React, { useState, useRef, useEffect } from 'react';
import MovieRow from "@/Components/MovieRow";
import Header from "@/Components/Header";
import Hero from "@/Components/Hero";
import Footer from "@/Components/Footer";

const AlphaMovies = () => {
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
            title: "Action",
            movies: [
                { id: 13, title: "Extraction", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" },
                { id: 14, title: "6 Underground", image: "https://images.unsplash.com/photo-1594736797933-d0db3ac3295d?w=300&h=450&fit=crop" },
                { id: 15, title: "The Old Guard", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop" },
                { id: 16, title: "Triple Frontier", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop" },
                { id: 17, title: "Bird Box", image: "https://images.unsplash.com/photo-1489599735734-79b1df2ebeeb?w=300&h=450&fit=crop" },
                { id: 18, title: "The Platform", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop" }
            ]
        },
        {
            title: "Adventure",
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
            <Header />
            {/* Hero Section */}
            <Hero />
            {/* Movie Rows */}

            <main className="relative z-10 -mt-36">
                {movieCategories.map((category, index) => (
                    <MovieRow key={index} category={category} rowIndex={index} />
                ))}
            </main>

            {/* Footer */}
            <Footer />

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