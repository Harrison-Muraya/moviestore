import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Search, Bell, User, Volume2, VolumeX } from 'lucide-react';

const NetflixClone = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

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

  const MovieCard = ({ movie, index }) => (
    <div 
      className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
      onMouseEnter={() => setHoveredItem(`${movie.id}-${index}`)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <img 
        src={movie.image} 
        alt={movie.title}
        className="w-full h-full object-cover"
      />
      {hoveredItem === `${movie.id}-${index}` && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-end p-4 transition-opacity duration-300">
          <h4 className="text-white font-bold text-sm mb-2">{movie.title}</h4>
          <div className="flex gap-2">
            <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-gray-200 transition-colors">
              <Play size={12} />
              Play
            </button>
            <button className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 hover:bg-gray-500 transition-colors">
              <Info size={12} />
              Info
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const scrollRow = (direction, rowIndex) => {
    const container = document.getElementById(`movie-row-${rowIndex}`);
    const scrollAmount = 768; // Width of about 4 movie cards
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const MovieRow = ({ category, rowIndex }) => (
    <div 
      className="mb-8 relative group"
      onMouseEnter={() => setHoveredRow(rowIndex)}
      onMouseLeave={() => setHoveredRow(null)}
    >
      <h3 className="text-white text-xl font-bold mb-4 px-4">{category.title}</h3>
      <div className="relative">
        {/* Left Arrow */}
        <button
          className={`absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-r transition-all duration-300 ${
            hoveredRow === rowIndex ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => scrollRow('left', rowIndex)}
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Right Arrow */}
        <button
          className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-2 rounded-l transition-all duration-300 ${
            hoveredRow === rowIndex ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => scrollRow('right', rowIndex)}
        >
          <ChevronRight size={24} />
        </button>

        <div 
          id={`movie-row-${rowIndex}`}
          className="flex gap-4 px-4 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {category.movies.map((movie, index) => (
            <MovieCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>
      </div>
    </div>
  );

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
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Video */}
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          loop
          playsInline
        >
          <source src={heroContent.videoUrl} type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=675&fit=crop)` }}
          />
        </video>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className="absolute top-1/2 right-8 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-300 border border-white border-opacity-50 hover:border-opacity-100"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        
        <div className="relative z-10 max-w-2xl px-4 ml-4">
          <h1 className="text-6xl font-bold mb-4">{heroContent.title}</h1>
          <p className="text-lg mb-8 leading-relaxed">{heroContent.description}</p>
          
          <div className="flex gap-4">
            <button className="bg-white text-black px-8 py-3 rounded flex items-center gap-2 font-semibold text-lg hover:bg-gray-200 transition-colors">
              <Play size={24} />
              Play
            </button>
            <button className="bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded flex items-center gap-2 font-semibold text-lg hover:bg-gray-500 hover:bg-opacity-70 transition-colors">
              <Info size={24} />
              More Info
            </button>
          </div>
        </div>
        
        {/* Age Rating and Genre Info */}
        <div className="absolute bottom-8 left-4 z-10 flex items-center gap-4 text-sm">
          <span className="bg-red-600 px-2 py-1 rounded text-white font-bold">TV-14</span>
          <span className="text-white">Sci-Fi • Drama • Thriller</span>
          <span className="text-gray-300">2016</span>
        </div>
      </section>

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

      <style jsx>{`
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

export default NetflixClone;