import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, X, Loader2, AlertCircle, RotateCcw,
} from 'lucide-react';

const VideoPlayer = ({ movie, onClose, isOpen = true }) => {
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
  const [autoPlayAttempted, setAutoPlayAttempted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const qualityOptions = ['HD', 'Full HD', '4K'];

  // Detect mobile device and orientation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    
    const checkOrientation = () => {
      if (window.innerHeight > window.innerWidth) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    checkMobile();
    checkOrientation();
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Reset state when movie changes
  useEffect(() => {
    if (movie && isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setVideoError(false);
      setIsLoading(true);
      setControlsVisible(true);
      setAutoPlayAttempted(false);
      setShowVolumeSlider(false);
      setShowQualityMenu(false);
    }
  }, [movie, isOpen]);

  // Auto-play when video is ready
  useEffect(() => {
    const video = videoRef.current;
    if (video && movie && isOpen && !autoPlayAttempted) {
      const attemptAutoPlay = async () => {
        try {
          setIsLoading(true);
          await video.play();
          setIsPlaying(true);
          setAutoPlayAttempted(true);
          setIsLoading(false);
        } catch (error) {
          console.log('Auto-play failed (this is normal in many browsers):', error);
          setIsLoading(false);
          setAutoPlayAttempted(true);
        }
      };

      if (video.readyState >= 3) {
        attemptAutoPlay();
      } else {
        const handleCanPlay = () => {
          attemptAutoPlay();
          video.removeEventListener('canplay', handleCanPlay);
        };
        video.addEventListener('canplay', handleCanPlay);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [movie, isOpen, autoPlayAttempted]);

  // Handle back to movies
  const handleBackToMovies = () => {
    window.location.href = route('newdashboard.layout'); 
  }

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;

    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

    // Detect swipe gestures
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 500) {
      if (deltaX > 0) {
        // Swipe right - skip forward
        handleSkip(10);
        showSkipIndicator('forward');
      } else {
        // Swipe left - skip backward
        handleSkip(-10);
        showSkipIndicator('backward');
      }
    }

    // Detect tap vs double tap
    const currentTime = Date.now();
    const tapLength = currentTime - lastTap;

    if (tapLength < 500 && tapLength > 0) {
      // Double tap detected
      if (isMobile && !isFullscreen) {
        handleFullscreen();
      } else {
        handleFullscreen();
      }
    } else {
      // Single tap - show/hide controls or play/pause
      if (controlsVisible) {
        handlePlayPause();
      } else {
        showControls();
      }
    }

    setLastTap(currentTime);
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const showSkipIndicator = (direction) => {
    // This could be enhanced with a visual indicator
    showControls();
  };

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
    if (!isMobile) {
      handleFullscreen();
    }
  };

  const handleVideoClick = (e) => {
    if (!isMobile) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < 500 && tapLength > 0) {
        handleFullscreen();
      } else {
        handlePlayPause();
      }

      setLastTap(currentTime);
      showControls();
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isMobile) {
        setControlsVisible(false);
      }
    }, isMobile ? 5000 : 3000); // Longer timeout on mobile
  };

  const handleMouseMove = () => {
    if (!isMobile) {
      showControls();
    }
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

  // Keyboard shortcuts (disabled on mobile)
  useEffect(() => {
    if (isMobile) return;

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
          } else if (onClose) {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [movie, isPlaying, isFullscreen, isOpen, isMobile]);

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

  // Don't render if no movie
  if (!movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white px-4">
          <AlertCircle size={isMobile ? 48 : 64} className="mx-auto mb-4 text-red-500" />
          <h3 className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>No Movie Found</h3>
          <p className="text-gray-400">The requested movie could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Player */}
      <div
        ref={playerRef}
        className="relative w-full h-full group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => !isMobile && setControlsVisible(false)}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {videoError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white px-4">
              <AlertCircle size={isMobile ? 48 : 64} className="mx-auto mb-4 text-red-500" />
              <h3 className={`font-bold mb-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>Video Unavailable</h3>
              <p className="text-gray-400 mb-4">Sorry, this video cannot be played right now.</p>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Back to Movies
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={movie.video_path?.startsWith('http')
                ? movie.video_path
                : `/storage/${movie.video_path}`
              }
              className="w-full h-full object-cover cursor-pointer"
              onClick={!isMobile ? handleVideoClick : undefined}
              onDoubleClick={handleDoubleClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              preload="auto"
              playsInline
            />

            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="bg-black/70 rounded-full p-4">
                  <Loader2 className="text-white animate-spin" size={isMobile ? 32 : 48} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Close Button - Top Right */}
        {!videoError && (
          <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-50 transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div
              onClick={onClose || handleBackToMovies}
              className={`bg-black/70 hover:bg-black/90 text-white rounded-full ${
                isMobile ? 'p-2' : 'p-3'
              } transition-all duration-200 transform hover:scale-110 backdrop-blur-sm cursor-pointer`}
              title="Close player"
            >
              <X size={isMobile ? 20 : 24} />
            </div>
          </div>
        )}

        {/* Mobile-specific touch hints */}
        {isMobile && !controlsVisible && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white/70">
              <div className="mb-2">
                <Play size={48} className="mx-auto mb-2" />
              </div>
              <p className="text-sm">Tap to play</p>
              <p className="text-xs mt-1">Swipe left/right to skip</p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        {!videoError && (
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent ${
            isMobile ? 'p-3' : 'p-6'
          } transition-all duration-300 ${
            controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            {/* Progress Bar */}
            <div className={isMobile ? 'mb-3' : 'mb-4'}>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className={`w-full ${isMobile ? 'h-1' : 'h-2'} bg-gray-600 rounded-lg appearance-none cursor-pointer`}
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                }}
              />
              <div className={`flex justify-between text-white ${isMobile ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
                <span className={`font-medium transition-colors duration-300 ${getTimeColor()}`}>
                  {formatTime(videoRef.current?.currentTime)}
                </span>
                <span className="text-gray-300">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className={`flex items-center ${isMobile && orientation === 'portrait' ? 'flex-col space-y-3' : 'justify-between'}`}>
              {/* Left Controls */}
              <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
                {onClose && !isMobile && (
                  <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors duration-200"
                    title="Back to movies"
                  >
                    <SkipBack size={28} />
                  </button>
                )}

                <button
                  onClick={() => handleSkip(-10)}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                  title="Skip back 10s"
                >
                  <SkipBack size={isMobile ? 20 : 24} />
                </button>

                <button
                  onClick={handlePlayPause}
                  className={`bg-red-600 hover:bg-red-700 text-white rounded-full ${
                    isMobile ? 'p-3' : 'p-4'
                  } transition-all duration-200 transform hover:scale-105`}
                  title={isPlaying ? "Pause" : "Play"}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={isMobile ? 20 : 28} />
                  ) : isPlaying ? (
                    <Pause size={isMobile ? 20 : 28} />
                  ) : (
                    <Play size={isMobile ? 20 : 28} />
                  )}
                </button>

                <button
                  onClick={() => handleSkip(10)}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                  title="Skip forward 10s"
                >
                  <SkipForward size={isMobile ? 20 : 24} />
                </button>

                {/* Volume Controls - Modified for mobile */}
                {isMobile ? (
                  <button
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    className="text-white hover:text-gray-300 transition-colors duration-200"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                ) : (
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
                )}
              </div>

              {/* Movie Title - Responsive positioning */}
              <div className={`text-white text-center ${isMobile && orientation === 'portrait' ? 'order-first' : ''}`}>
                <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>{movie.title}</h3>
                <p className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-base'}`}>
                  {movie.genres?.map(g => g.name).join(', ') || movie.genre} • {movie.year} • {movie.duration}
                </p>
              </div>

              {/* Right Controls */}
              <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-2'}`}>
                {/* Quality Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-gray-300 transition-colors duration-200"
                    title="Quality settings"
                  >
                    <Settings size={isMobile ? 20 : 28} />
                  </button>
                  {showQualityMenu && (
                    <div className={`absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[100px] ${
                      isMobile ? 'text-sm' : ''
                    }`}>
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
                  <Maximize size={isMobile ? 20 : 28} />
                </button>
              </div>
            </div>

            {/* Mobile Volume Slider */}
            {isMobile && showVolumeSlider && (
              <div className="mt-3 flex items-center space-x-3">
                <VolumeX size={16} className="text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${isMuted ? 0 : volume}%, #4b5563 ${isMuted ? 0 : volume}%, #4b5563 100%)`
                  }}
                />
                <Volume2 size={16} className="text-gray-400" />
                <span className="text-white text-xs w-8 text-center">
                  {Math.round(isMuted ? 0 : volume)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Center play/pause indicator */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200 ${
          !controlsVisible && !isPlaying && !isLoading ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-black/50 rounded-full p-6">
            <Play className="text-white" size={isMobile ? 32 : 48} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;