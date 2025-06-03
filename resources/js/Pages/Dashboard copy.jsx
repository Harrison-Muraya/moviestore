import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

const VideoPlayer = () => {
  const [currentMovie, setCurrentMovie] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  // Sample movie data
  const latestMovies = [
    {
      id: 1,
      title: "Cosmic Horizons",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop",
      duration: "2h 15m",
      genre: "Sci-Fi",
      year: "2024",
      description: "A thrilling journey through space and time as humanity discovers new worlds beyond imagination.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      id: 2,
      title: "Ocean's Mystery",
      thumbnail: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=400&fit=crop",
      duration: "1h 48m",
      genre: "Adventure",
      year: "2024",
      description: "Deep beneath the waves lies a secret that could change everything we know about our planet.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    {
      id: 3,
      title: "Neon Nights",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
      duration: "2h 2m",
      genre: "Thriller",
      year: "2024",
      description: "In a cyberpunk future, one detective must solve the case that will determine humanity's fate.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      id: 4,
      title: "Mountain's Call",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
      duration: "1h 55m",
      genre: "Drama",
      year: "2024",
      description: "A story of courage and determination as climbers face their greatest challenge yet.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    {
      id: 5,
      title: "Digital Dreams",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
      duration: "2h 12m",
      genre: "Sci-Fi",
      year: "2024",
      description: "When reality and virtual worlds collide, what defines what is real?",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
    },
    {
      id: 6,
      title: "Desert Winds",
      thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&h=400&fit=crop",
      duration: "1h 43m",
      genre: "Western",
      year: "2024",
      description: "A lone wanderer discovers that some legends are more real than anyone believed.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    }
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleProgressChange = (e) => {
    if (videoRef.current) {
      const newTime = (e.target.value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateProgress = () => {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
      };

      const updateDuration = () => {
        setDuration(video.duration);
      };

      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('loadedmetadata', updateDuration);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [currentMovie]);

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectMovie = (movie) => {
    setCurrentMovie(movie);
    setIsPlaying(false);
    setProgress(0);
  };

  if (currentMovie) {
    return (
      <div className="min-h-screen bg-black">
        {/* Video Player */}
        <div className="relative w-full h-screen">
          <video
            ref={videoRef}
            src={currentMovie.videoUrl}
            className="w-full h-full object-cover"
            onClick={handlePlayPause}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-white text-sm mt-1">
                <span>{formatTime(videoRef.current?.currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentMovie(null)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={handleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </div>
              
              <div className="text-white">
                <h3 className="text-xl font-bold">{currentMovie.title}</h3>
                <p className="text-gray-300">{currentMovie.genre} • {currentMovie.year}</p>
              </div>
              
              <button className="text-white hover:text-gray-300 transition-colors">
                <Maximize size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            CineStream
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Immerse yourself in a world of cinematic excellence. Discover, stream, and experience movies like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Watching
            </button>
            <button className="border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-bounce delay-1000"></div>
      </div>



      {/* Latest Movies Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Latest Movies
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Discover the newest additions to our collection
          </p>
          
          <div className="relative">
            <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
              {latestMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex-none w-72 group cursor-pointer"
                  onClick={() => selectMovie(movie)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-gray-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-red-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                        <Play className="text-white" size={32} />
                      </div>
                    </div>
                    
                    {/* Movie Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-xl font-bold mb-2">{movie.title}</h3>
                      <p className="text-gray-300 text-sm mb-2">{movie.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{movie.genre}</span>
                        <span>{movie.year}</span>
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
              View All Movies
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">CineStream</h3>
          <p className="text-gray-400 mb-6">Your gateway to unlimited entertainment</p>
          <div className="text-gray-500 text-sm">
            © 2024 CineStream. All rights reserved.
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
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;