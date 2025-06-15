import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Maximize, Settings, X, Loader2, AlertCircle 
} from 'lucide-react';

const VideoPlayer = ({ movie, onClose, isOpen }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('HD');

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const qualityOptions = ['HD', 'Full HD', '4K'];

  // Reset state when movie changes
  useEffect(() => {
    if (movie && isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setVideoError(false);
      setIsLoading(false);
      setControlsVisible(true);
    }
  }, [movie, isOpen]);

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

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      if (!movie || !isOpen) return;

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
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [movie, isPlaying, isFullscreen, isOpen]);

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (video && movie && isOpen) {
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
  }, [movie, isOpen]);

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

  // Don't render if not open or no movie
  if (!isOpen || !movie) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Player */}
      <div
        ref={playerRef}
        className="relative w-full h-full group"
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
                onClick={onClose}
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
              src={movie.video_path?.startsWith('http')
                ? movie.video_path 
                : movie.video_path || 'https://www.w3schools.com/html/mov_bbb.mp4'
              }
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

        {/* Close Button - Top Right */}
        <div className={`absolute top-4 right-4 z-50 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <button
            onClick={onClose}
            className="bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
            title="Close player"
          >
            <X size={24} />
          </button>
        </div>

        {/* Video Controls Overlay */}
        {!videoError && (
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                }}
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
                  onClick={onClose}
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
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      title="Volume"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${isMuted ? 0 : volume}%, #4b5563 ${isMuted ? 0 : volume}%, #4b5563 100%)`
                      }}
                    />
                  </div>
                  <span className="text-white text-sm w-8 opacity-0 group-hover/volume:opacity-100 transition-opacity duration-200">
                    {Math.round(isMuted ? 0 : volume)}
                  </span>
                </div>
              </div>

              <div className="text-white text-center">
                <h3 className="text-2xl font-bold">{movie.title}</h3>
                <p className="text-gray-300">
                  {movie.genres || movie.genre} • {movie.year} • {movie.duration}
                </p>
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
                          className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedQuality === quality
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
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200 ${
          !controlsVisible && !isPlaying && !isLoading ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-black/50 rounded-full p-6">
            <Play className="text-white" size={48} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component showing how to use the VideoPlayer
const VideoPlayerDemo = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Sample movie data
  const sampleMovies = [
    {
      id: 1,
      title: "Sample Movie 1",
      genres: "Action",
      year: 2023,
      duration: "2h 15m",
      video_path: "https://www.w3schools.com/html/mov_bbb.mp4",
      poster: "https://via.placeholder.com/300x450/1f2937/ffffff?text=Movie+1"
    },
    {
      id: 2,
      title: "Sample Movie 2",
      genres: "Drama",
      year: 2022,
      duration: "1h 50m",
      video_path: "https://www.w3schools.com/html/movie.mp4",
      poster: "https://via.placeholder.com/300x450/374151/ffffff?text=Movie+2"
    },
    {
      id: 3,
      title: "Sample Movie 3",
      genres: "Comedy",
      year: 2024,
      duration: "1h 35m",
      video_path: "https://www.w3schools.com/html/mov_bbb.mp4",
      poster: "https://via.placeholder.com/300x450/4b5563/ffffff?text=Movie+3"
    }
  ];

  const openPlayer = (movie) => {
    setSelectedMovie(movie);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setIsPlayerOpen(false);
    setSelectedMovie(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">Video Player Demo</h1>
      
      {/* Movie Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {sampleMovies.map(movie => (
          <div
            key={movie.id}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            onClick={() => openPlayer(movie)}
          >
            <div className="relative">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Play className="text-white" size={48} />
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
              <p className="text-gray-400">{movie.genres} • {movie.year} • {movie.duration}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">How to Use</h2>
        <div className="text-gray-300 space-y-2">
          <p>• Click on any movie poster to open the video player</p>
          <p>• Use keyboard shortcuts: Space (play/pause), Arrow keys (skip), M (mute), F (fullscreen), Escape (close)</p>
          <p>• Click video to play/pause, double-click for fullscreen</p>
          <p>• Hover over volume icon to show volume slider</p>
          <p>• Controls auto-hide after 3 seconds during playback</p>
        </div>
      </div>

      {/* Video Player Component */}
      <VideoPlayer
        movie={selectedMovie}
        isOpen={isPlayerOpen}
        onClose={closePlayer}
      />
    </div>
  );
};

export default VideoPlayerDemo;