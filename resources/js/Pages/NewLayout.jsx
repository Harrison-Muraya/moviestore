import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, Search, Bell, User, Menu, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';

const NetflixInterface = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const [trendingMovies, setTreds] = useState([]);
  const [trailers, setMovies] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);

  // stranger things trailer
  // const `strangerThingsTrailer` = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/StrangerThings.mp4';

  // loading data from database
  useEffect(() => {
    const url = route('getmoviedata');
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === true) {
          setTreds(data.response.trendingMovies);
          setMovies(data.response.setMovies);

          // Pick a random trailer AFTER loading
          const loadedTrailers = data.response.setMovies;
          console.log("Loaded Trailers:", loadedTrailers);

          if (loadedTrailers && loadedTrailers.length > 0) {
            const random = loadedTrailers[Math.floor(Math.random() * loadedTrailers.length)];
            setCurrentTrailer(random);
            console.log("Random Trailer Selected:", random);
            // setCurrentTrailer(random?.trailer_path ? random : { 
            //   id: 'fallback', // Add fallback id
            //   trailer_path: strangerThingsTrailer,
            //   title: 'Stranger Things',
            //   description: 'Alpha got you covered with the latest movies and TV shows. Enjoy a seamless streaming experience with our user-friendly interface and high-quality content.'
            // });
          } else {
            // No trailers available, use fallback
            // setCurrentTrailer({ 
            //   id: 'fallback',
            //   trailer_path: strangerThingsTrailer,
            //   title: 'Stranger Things',
            //   description: 'Alpha got you covered with the latest movies and TV shows. Enjoy a seamless streaming experience with our user-friendly interface and high-quality content.'
            // });
          }
        } else {
          console.error("Failed to fetch movies:", data);
          // Set fallback on error
          // setCurrentTrailer({ 
          //   id: 'fallback',
          //   trailer_path: strangerThingsTrailer,
          //   title: 'Stranger Things',
          //   description: 'Alpha got you covered with the latest movies and TV shows. Enjoy a seamless streaming experience with our user-friendly interface and high-quality content.'
          // });
        }
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        // Set fallback on error
        // setCurrentTrailer({ 
        //   id: 'fallback',
        //   trailer_path: strangerThingsTrailer,
        //   title: 'Stranger Things',
        //   description: 'Alpha got you covered with the latest movies and TV shows. Enjoy a seamless streaming experience with our user-friendly interface and high-quality content.'
        // });
      });
  }, []);

  useEffect(() => {

    console.log("Current Trailer harris:", currentTrailer);
  }, [currentTrailer]);

  // Effect to handle video mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Function to handle movie watch action
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Function to handle watch movie click
  const handleWatchMovie = (e) => {
    if (!currentTrailer?.id || currentTrailer.id === 'fallback') {
      e.preventDefault();
      alert('This is a demo trailer. Please select a movie from the trending section to watch.');
    }
  };

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* Background Video */}
      {currentTrailer && currentTrailer.trailer_path && (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted={isMuted}
            loop
            playsInline
          >
            <source src={currentTrailer?.trailer_path?.startsWith('http') ? currentTrailer?.trailer_path : `/storage/${currentTrailer?.trailer_path}`} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <Menu className="w-6 h-6 md:hidden" />
            <h1 className="text-indigo-600 text-2xl font-bold">ALPHA
              <span className="text-red-600">.</span>
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href={route('movieList')} className="text-white hover:text-gray-300 transition-colors">Movies</Link>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">New & Popular</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Search className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          <Bell className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentTrailer && currentTrailer.trailer_path && (
        <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 md:px-12 pb-20">
          <div className="max-w-2xl">
            <div className="mb-4">
              <span className="bg-red-600 text-white px-2 py-1 text-sm font-semibold rounded">
                New Movie
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              {currentTrailer.title || 'Keluarga Cem'}
            </h2>

            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
              {currentTrailer.description || currentTrailer.title || "Alpha got you covered with the latest movies and TV shows. Enjoy a seamless streaming experience with our user-friendly interface and high-quality content."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {currentTrailer?.id && currentTrailer.id !== 'fallback' ? (
                <Link href={route('video.player', { id: currentTrailer.id })}
                  className="flex items-center justify-center bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Watch Movie
                </Link>
              ) : (
                <button
                  onClick={handleWatchMovie}
                  className="flex items-center justify-center bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Watch Movie
                </button>
              )}
              <button className="flex items-center justify-center bg-gray-600/70 text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors backdrop-blur-sm">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </button>
            </div>
          </div>

          {/* Sound Control */}
          <button
            onClick={toggleMute}
            className="absolute bottom-32 right-4 md:right-12 bg-gray-800/70 hover:bg-gray-700/70 p-3 rounded-full transition-colors backdrop-blur-sm"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Trending Section */}
      <div className="relative z-10 px-4 md:px-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Trending Now</h3>
          <button className="flex items-center text-gray-300 hover:text-white transition-colors">
            See more
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {trendingMovies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 group cursor-pointer">
              <div className="relative w-48 h-64 rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={movie.thumbnail?.startsWith('http')
                    ? movie.thumbnail
                    : `/storage/${movie.thumbnail}`
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`${movie.color || 'bg-red-600'} text-white text-xs px-2 py-1 rounded font-medium`}>
                    {movie.genres[0]?.name || 'Unknown Genre'}
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-white font-semibold text-lg leading-tight capitalize">
                    {movie.title}
                  </h4>
                </div>

                {/* Hover Play Button */}
                <Link href={route('video.player', { id: movie.id })} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
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

export default NetflixInterface;