import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Search, Heart, Plus, Settings, Loader2, AlertCircle, X } from 'lucide-react';

export default function Dashboard() {
    const [isDark, setIsDark] = useState(true);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [volume, setVolume] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastTap, setLastTap] = useState(0);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [favorites, setFavorites] = useState(new Set());
    const [watchlist, setWatchlist] = useState(new Set());
    const [watchProgress, setWatchProgress] = useState({});
    const [selectedGenre, setSelectedGenre] = useState('All');
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [selectedQuality, setSelectedQuality] = useState('HD');


    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const videoRefs = useRef({});

    const [latestMovies, setMovies] = useState([]);


    // loading data from database
    useEffect(() => {
        const url = route('getmoviedata');

        fetch(url, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === true) {
                    console.log("setMovies retrieved successfully:", data.response.setMovies);
                    // Appending Movies and production records to the state
                    setMoviess(data.response.setMovies)
                } else {
                    console.error("Failed to fetch movies:", data);
                }
            })
            .catch((error) => console.error("Error fetching movies:", error));
    }, []);
    // Sample movie data with additional metadata
    const latestMoviess = [
        {
            id: 1,
            title: "Cosmic Horizons",
            thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop",
            duration: "2h 15m",
            durationSeconds: 8100,
            genre: "Sci-Fi",
            year: "2024",
            rating: 8.5,
            description: "A thrilling journey through space and time as humanity discovers new worlds beyond imagination.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            cast: ["Emma Stone", "Ryan Gosling", "John Krasinski"],
            director: "Christopher Nolan"
        },
        {
            id: 2,
            title: "Ocean's Mystery",
            thumbnail: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=400&fit=crop",
            duration: "1h 48m",
            durationSeconds: 6480,
            genre: "Adventure",
            year: "2024",
            rating: 7.8,
            description: "Deep beneath the waves lies a secret that could change everything we know about our planet.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            cast: ["Zendaya", "Timothée Chalamet", "Oscar Isaac"],
            director: "Denis Villeneuve"
        },
        {
            id: 3,
            title: "Neon Nights",
            thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
            duration: "2h 2m",
            durationSeconds: 7320,
            genre: "Thriller",
            year: "2024",
            rating: 9.1,
            description: "In a cyberpunk future, one detective must solve the case that will determine humanity's fate.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            cast: ["Keanu Reeves", "Scarlett Johansson", "Michael Shannon"],
            director: "The Wachowskis"
        },
        {
            id: 4,
            title: "Mountain's Call",
            thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
            duration: "1h 55m",
            durationSeconds: 6900,
            genre: "Drama",
            year: "2024",
            rating: 8.2,
            description: "A story of courage and determination as climbers face their greatest challenge yet.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            cast: ["Jake Gyllenhaal", "Elisabeth Moss", "Oscar Isaac"],
            director: "Alejandro G. Iñárritu"
        },
        {
            id: 5,
            title: "Digital Dreams",
            thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
            duration: "2h 12m",
            durationSeconds: 7920,
            genre: "Sci-Fi",
            year: "2024",
            rating: 8.7,
            description: "When reality and virtual worlds collide, what defines what is real?",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            cast: ["Anya Taylor-Joy", "Dev Patel", "Lupita Nyong'o"],
            director: "Jordan Peele"
        },
        {
            id: 6,
            title: "Desert Winds",
            thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&h=400&fit=crop",
            duration: "1h 43m",
            durationSeconds: 6180,
            genre: "Western",
            year: "2024",
            rating: 7.5,
            description: "A lone wanderer discovers that some legends are more real than anyone believed.",
            videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            cast: ["Adam Driver", "Saoirse Ronan", "Oscar Isaac"],
            director: "Coen Brothers"
        }
    ];

    const genres = ['All', 'Sci-Fi', 'Adventure', 'Thriller', 'Drama', 'Western'];
    const qualityOptions = ['HD', 'Full HD', '4K'];

    // Filter movies based on search term and genre
    const filteredMovies = latestMovies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            movie.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    // Video player functions with error handling
    const handlePlayPause = () => {
        if (videoRef.current && !videoError) {
            try {
                if (isPlaying) {
                    videoRef.current.pause();
                } else {
                    setIsLoading(true);
                    videoRef.current.play().catch(handleVideoError);
                }
                setIsPlaying(!isPlaying);
            } catch (error) {
                handleVideoError(error);
            }
        }
    };

    const handleVideoError = (error) => {
        console.error('Video playback error:', error);
        setVideoError(true);
        setIsLoading(false);
        setIsPlaying(false);
    };

    const handleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume / 100;
            if (newVolume === '0') {
                setIsMuted(true);
                videoRef.current.muted = true;
            } else if (isMuted) {
                setIsMuted(false);
                videoRef.current.muted = false;
            }
        }
    };

    const handleProgressChange = (e) => {
        if (videoRef.current) {
            const newTime = (e.target.value / 100) * duration;
            videoRef.current.currentTime = newTime;
            setProgress(e.target.value);
        }
    };

    const handleSkip = (seconds) => {
        if (videoRef.current) {
            const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
            videoRef.current.currentTime = newTime;
        }
    };

    const handleFullscreen = async () => {
        if (!playerRef.current) return;

        try {
            if (!isFullscreen) {
                if (playerRef.current.requestFullscreen) {
                    await playerRef.current.requestFullscreen();
                } else if (playerRef.current.webkitRequestFullscreen) {
                    await playerRef.current.webkitRequestFullscreen();
                } else if (playerRef.current.mozRequestFullScreen) {
                    await playerRef.current.mozRequestFullScreen();
                } else if (playerRef.current.msRequestFullscreen) {
                    await playerRef.current.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const handleDoubleClick = (e) => {
        e.preventDefault();
        handleFullscreen();
    };

    const handleVideoClick = (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 500 && tapLength > 0) {
            // Double tap detected
            handleFullscreen();
        } else {
            // Single tap - toggle play/pause
            handlePlayPause();
        }

        setLastTap(currentTime);
        showControls();
    };

    const showControls = () => {
        setControlsVisible(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setControlsVisible(false);
            }
        }, 3000);
    };

    const handleMouseMove = () => {
        showControls();
    };

    const selectMovie = (movie) => {
        setCurrentMovie(movie);
        setIsPlaying(false);
        setProgress(0);
        setVideoError(false);
        setIsLoading(false);

        // Restore watch progress if exists
        const savedProgress = watchProgress[movie.id];
        if (savedProgress && videoRef.current) {
            setTimeout(() => {
                videoRef.current.currentTime = savedProgress;
                setProgress((savedProgress / movie.durationSeconds) * 100);
            }, 100);
        }
    };

    const toggleFavorite = (movieId, e) => {
        e.stopPropagation();
        const newFavorites = new Set(favorites);
        if (newFavorites.has(movieId)) {
            newFavorites.delete(movieId);
        } else {
            newFavorites.add(movieId);
        }
        setFavorites(newFavorites);
    };

    const toggleWatchlist = (movieId, e) => {
        e.stopPropagation();
        const newWatchlist = new Set(watchlist);
        if (newWatchlist.has(movieId)) {
            newWatchlist.delete(movieId);
        } else {
            newWatchlist.add(movieId);
        }
        setWatchlist(newWatchlist);
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search functionality is handled by the filter effect
    };

    // Get dynamic color for time indicator based on progress
    const getTimeColor = () => {
        if (progress < 25) return 'text-red-500';
        if (progress < 50) return 'text-yellow-500';
        if (progress < 75) return 'text-blue-500';
        return 'text-green-500';
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!currentMovie) return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleSkip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleSkip(10);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    handleMute();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    handleFullscreen();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        handleFullscreen();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [currentMovie, isPlaying, isFullscreen]);

    // Save watch progress
    useEffect(() => {
        if (currentMovie && videoRef.current) {
            const interval = setInterval(() => {
                const currentTime = videoRef.current.currentTime;
                if (currentTime > 30) { // Only save if watched for more than 30 seconds
                    setWatchProgress(prev => ({
                        ...prev,
                        [currentMovie.id]: currentTime
                    }));
                }
            }, 10000); // Save every 10 seconds

            return () => clearInterval(interval);
        }
    }, [currentMovie]);

    // Dark mode effect
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    // Video progress tracking
    useEffect(() => {
        const video = videoRef.current;
        if (video && currentMovie) {
            const updateProgress = () => {
                const progressPercent = (video.currentTime / video.duration) * 100;
                setProgress(progressPercent);
                setIsLoading(false);
            };

            const updateDuration = () => {
                setDuration(video.duration);
                setIsLoading(false);
            };

            const handleLoadStart = () => setIsLoading(true);
            const handleCanPlay = () => setIsLoading(false);
            const handleError = (e) => handleVideoError(e);
            const handleWaiting = () => setIsLoading(true);
            const handlePlaying = () => setIsLoading(false);

            video.addEventListener('timeupdate', updateProgress);
            video.addEventListener('loadedmetadata', updateDuration);
            video.addEventListener('loadstart', handleLoadStart);
            video.addEventListener('canplay', handleCanPlay);
            video.addEventListener('error', handleError);
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('playing', handlePlaying);

            return () => {
                video.removeEventListener('timeupdate', updateProgress);
                video.removeEventListener('loadedmetadata', updateDuration);
                video.removeEventListener('loadstart', handleLoadStart);
                video.removeEventListener('canplay', handleCanPlay);
                video.removeEventListener('error', handleError);
                video.removeEventListener('waiting', handleWaiting);
                video.removeEventListener('playing', handlePlaying);
            };
        }
    }, [currentMovie]);

    // Fullscreen change detection
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Cleanup timeout on component unmount
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    // If a movie is selected, show the video player
    if (currentMovie) {
        return (
            <div className="min-h-screen bg-black">
                {/* Video Player */}
                <div
                    ref={playerRef}
                    className="relative w-full h-screen group"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setControlsVisible(false)}
                >
                    {videoError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <div className="text-center text-white">
                                <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
                                <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
                                <p className="text-gray-400 mb-4">Sorry, this video cannot be played right now.</p>
                                <button
                                    onClick={() => setCurrentMovie(null)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Back to Movies
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={currentMovie.videoUrl}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={handleVideoClick}
                                onDoubleClick={handleDoubleClick}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />

                            {/* Loading Spinner */}
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <div className="bg-black/70 rounded-full p-4">
                                        <Loader2 className="text-white animate-spin" size={48} />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Exit Fullscreen Button - Top Right */}
                    {isFullscreen && (
                        <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                            }`}>
                            <button
                                onClick={() => window.location.reload()}
                                // onClick={handleFullscreen}
                                className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                                title="Exit fullscreen"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    )}

                    {/* Video Controls Overlay */}
                    {!videoError && (
                        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}>
                            {/* Progress Bar */}
                            <div className="mb-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress}
                                    onChange={handleProgressChange}
                                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-white text-sm mt-2">
                                    <span className={`font-medium transition-colors duration-300 ${getTimeColor()}`}>
                                        {formatTime(videoRef.current?.currentTime)}
                                    </span>
                                    <span className="text-gray-300">{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setCurrentMovie(null)}
                                        className="text-white hover:text-red-500 transition-colors duration-200"
                                        title="Back to movies"
                                    >
                                        <SkipBack size={28} />
                                    </button>

                                    <button
                                        onClick={() => handleSkip(-10)}
                                        className="text-white hover:text-gray-300 transition-colors duration-200"
                                        title="Skip back 10s"
                                    >
                                        <SkipBack size={24} />
                                    </button>

                                    <button
                                        onClick={handlePlayPause}
                                        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-105"
                                        title={isPlaying ? "Pause" : "Play"}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" size={28} />
                                        ) : isPlaying ? (
                                            <Pause size={28} />
                                        ) : (
                                            <Play size={28} />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleSkip(10)}
                                        className="text-white hover:text-gray-300 transition-colors duration-200"
                                        title="Skip forward 10s"
                                    >
                                        <SkipForward size={24} />
                                    </button>

                                    {/* Volume Controls */}
                                    <div className="flex items-center space-x-2 group/volume">
                                        <button
                                            onClick={handleMute}
                                            className="text-white hover:text-gray-300 transition-colors duration-200"
                                            title={isMuted ? "Unmute" : "Mute"}
                                        >
                                            {isMuted || volume === 0 ? <VolumeX size={28} /> : <Volume2 size={28} />}
                                        </button>
                                        <div className="opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200">
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer volume-slider"
                                                title="Volume"
                                            />
                                        </div>
                                        <span className="text-white text-sm w-8 opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200">
                                            {Math.round(isMuted ? 0 : volume)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-white text-center">
                                    <h3 className="text-2xl font-bold">{currentMovie.title}</h3>
                                    <p className="text-gray-300">{currentMovie.genre} • {currentMovie.year} • {currentMovie.duration}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Quality Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowQualityMenu(!showQualityMenu)}
                                            className="text-white hover:text-gray-300 transition-colors duration-200"
                                            title="Quality settings"
                                        >
                                            <Settings size={28} />
                                        </button>
                                        {showQualityMenu && (
                                            <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[100px]">
                                                {qualityOptions.map(quality => (
                                                    <button
                                                        key={quality}
                                                        onClick={() => {
                                                            setSelectedQuality(quality);
                                                            setShowQualityMenu(false);
                                                        }}
                                                        className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedQuality === quality
                                                            ? 'bg-red-600 text-white'
                                                            : 'text-gray-300 hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {quality}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleFullscreen}
                                        className="text-white hover:text-gray-300 transition-colors duration-200"
                                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                                    >
                                        <Maximize size={28} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Center play/pause indicator */}
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200 ${!controlsVisible && !isPlaying && !isLoading ? 'opacity-100' : 'opacity-0'
                        }`}>
                        <div className="bg-black/50 rounded-full p-6">
                            <Play className="text-white" size={48} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main dashboard view
    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white transition-all duration-500">
            {/* Header */}
            <header className="relative z-20 px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-wider">
                            <span className="text-indigo-600">ALPHA</span>
                            <span className="text-red-600">.</span>
                        </h1>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex max-w-md gap-2 flex-1 md:flex-none">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg bg-white/10 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                placeholder="Search movies, actors, directors..."
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            Search
                        </button>
                    </form>

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                            {isDark ? '🌙 Dark' : '🌞 Light'}
                        </span>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark
                                ? 'bg-indigo-600 justify-end'
                                : 'bg-gray-300 dark:bg-gray-600 justify-start'
                                }`}
                        >
                            <div className="w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"></div>
                        </button>
                    </div>
                </div>
            </header>


            {/* Main Content */}
            <main className="relative">
                {/* Hero Video Section */}
                <div className="relative h-[60vh] md:h-[70vh] overflow-hidden rounded-xl mx-6 mb-8">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
                    >
                        <source src="/trailers/STRANGER_THINGS_Season_5_Trailer__2025.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-xl"></div>

                    {/* Hero Content */}
                    <div className="relative z-10 flex h-full items-end p-8">
                        <div className="text-white max-w-2xl">
                            <h2 className="text-4xl md:text-6xl font-bold mb-4">
                                Welcome to Alpha
                            </h2>
                            <p className="text-lg md:text-xl text-gray-200 mb-6">
                                Discover unlimited streaming content with premium quality
                            </p>
                            <button onClick={() => selectMovie(movie)} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105">
                                Start Watching
                            </button>
                        </div>
                    </div>
                </div>

                {/* Latest Movies Section */}
                <section className="px-6 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                {searchTerm ? `Search Results for "${searchTerm}"` : 'Latest Movies'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                {searchTerm
                                    ? `Found ${filteredMovies.length} movies`
                                    : 'Discover the newest additions to our collection'
                                }
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
                                {filteredMovies.map((movie) => (
                                    <div
                                        key={movie.id}
                                        className="flex-none w-80 group cursor-pointer"
                                        onClick={() => selectMovie(movie)}
                                    >
                                        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                                            {/* <video
                                                autoPlay
                                                muted
                                                playsInline
                                                src={movie.videoUrl}
                                                // src={movie.thumbnail}
                                                alt={movie.title}
                                                className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-110"
                                            /> */}


                                            <video
                                                ref={(el) => (videoRefs.current[movie.id] = el)}
                                                muted
                                                playsInline
                                                src={movie.videoUrl}
                                                className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-110"
                                                onMouseEnter={() => {
                                                    const video = videoRefs.current[movie.id];
                                                    if (video) {
                                                        video.currentTime = 0;
                                                        video.play();
                                                    }
                                                }}
                                                onMouseLeave={() => {
                                                    const video = videoRefs.current[movie.id];
                                                    if (video) {
                                                        video.pause();
                                                        video.currentTime = 0;
                                                    }
                                                }}
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
                                                <p className="text-gray-300 text-sm mb-2 line-clamp-2">{movie.description}</p>
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

                        {filteredMovies.length === 0 && searchTerm && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    No movies found matching "{searchTerm}"
                                </p>
                            </div>
                        )}

                        <div className="text-center mt-8">
                            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                                View All Movies
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Custom Styles */}
            <style >{`
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
                .volume-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                }
                .volume-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}