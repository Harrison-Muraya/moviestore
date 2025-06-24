import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Volume1,
  Maximize, Settings, X, Loader2, AlertCircle, Plus, ThumbsUp,
  Download, Share, MoreHorizontal, ChevronDown, Minimize
} from 'lucide-react';

const VideoPlayer = ({ movie, onClose, isOpen = true }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [autoPlayAttempted, setAutoPlayAttempted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSkipAnimation, setShowSkipAnimation] = useState({ show: false, direction: '' });

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  const qualityOptions = ['Auto', '480p', '720p', '1080p', '4K'];

  // Netflix-style sample movie data fallback
  const movieData = movie || {
    title: 'Sample Movie',
    year: '2024',
    duration: '2h 15m',
    genre: 'Action',
    rating: '16+',
    description: 'An epic adventure that will keep you on the edge of your seat.',
    video_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  };

  // Mobile detection and orientation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkMobile();
    checkOrientation();

    const handleResize = () => {
      checkMobile();
      checkOrientation();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Netflix-style auto-hide controls
  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, isMobile ? 4000 : 3000);
  };

  // Enhanced touch gestures
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEndData = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEndData.x - touchStart.x;
    const deltaY = touchEndData.y - touchStart.y;
    const deltaTime = touchEndData.time - touchStart.time;

    // Vertical swipe for volume (right side) or brightness (left side)
    if (Math.abs(deltaY) > 50 && Math.abs(deltaX) < 100 && deltaTime < 500) {
      if (touchStart.x > window.innerWidth / 2) {
        // Right side - volume control
        const volumeChange = deltaY > 0 ? -10 : 10;
        const newVolume = Math.max(0, Math.min(100, volume + volumeChange));
        setVolume(newVolume);
        if (videoRef.current) {
          videoRef.current.volume = newVolume / 100;
        }
        showVolumeIndicator(newVolume);
      }
    }

    // Horizontal swipe for seeking
    if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100 && deltaTime < 500) {
      const seekTime = deltaX > 0 ? 10 : -10;
      handleSkip(seekTime);
      showSkipIndicator(deltaX > 0 ? 'forward' : 'backward');
    }

    // Single tap to show/hide controls
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300) {
      if (controlsVisible) {
        handlePlayPause();
      } else {
        showControls();
      }
    }

    setTouchStart(null);
  };

  const showSkipIndicator = (direction) => {
    setShowSkipAnimation({ show: true, direction });
    setTimeout(() => setShowSkipAnimation({ show: false, direction: '' }), 800);
  };

  const showVolumeIndicator = (vol) => {
    // Could implement a visual volume indicator here
    showControls();
  };

  // Video controls
  const handlePlayPause = () => {
    if (!videoRef.current || videoError) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(handleVideoError);
      }
    } catch (error) {
      handleVideoError(error);
    }
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    setVideoError(true);
    setIsLoading(false);
    setIsPlaying(false);
  };

  const handleSkip = (seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    showControls();
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const newTime = (progressPercent / 100) * duration;

    videoRef.current.currentTime = newTime;
    setProgress(progressPercent);
  };

  const handleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      if (!isFullscreen) {
        await playerRef.current.requestFullscreen?.() ||
          playerRef.current.webkitRequestFullscreen?.() ||
          playerRef.current.mozRequestFullScreen?.();
      } else {
        await document.exitFullscreen?.() ||
          document.webkitExitFullscreen?.() ||
          document.mozCancelFullScreen?.();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);

        // Update buffered progress
        if (video.buffered.length > 0) {
          const bufferedPercent = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
          setBuffered(bufferedPercent);
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleVideoError);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleVideoError);
    };
  }, [duration]);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

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
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(100, prev + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 10));
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted(!isMuted);
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isFullscreen, isMuted, volume]);

  // Auto-hide controls on mouse movement
  useEffect(() => {
    if (isPlaying && !isMobile) {
      showControls();
    }
  }, [isPlaying, isMobile]);

  if (videoError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white px-6">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Unable to Play Video</h2>
          <p className="text-gray-400 mb-6">There was an error loading this content.</p>
          <button
            onClick={onClose}
            className="bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div
        ref={playerRef}
        className="relative w-full h-full overflow-hidden"
        onMouseMove={!isMobile ? showControls : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={movieData.video_path?.startsWith('http')
            ? movieData.video_path
            : `/storage/${movieData.video_path}`}
          className="w-full h-full object-cover"
          onClick={!isMobile ? handlePlayPause : undefined}
          onDoubleClick={!isMobile ? handleFullscreen : undefined}
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
        />

        {/* Netflix-style Gradient Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'
          }`} />

        {/* Loading Spinner */}
        {(isLoading || isBuffering) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-6 backdrop-blur-sm">
              <Loader2 className="text-red-500 animate-spin" size={isMobile ? 32 : 48} />
            </div>
          </div>
        )}

        {/* Skip Animation Indicators */}
        {showSkipAnimation.show && (
          <div className={`absolute inset-0 flex items-center ${showSkipAnimation.direction === 'forward' ? 'justify-end pr-12' : 'justify-start pl-12'
            } pointer-events-none`}>
            <div className="bg-black/70 rounded-full p-4 animate-pulse">
              {showSkipAnimation.direction === 'forward' ? (
                <SkipForward className="text-white" size={32} />
              ) : (
                <SkipBack className="text-white" size={32} />
              )}
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={isMobile ? 20 : 24} />
              </button>
              <div className="text-white">
                <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {movieData.title}
                </h1>
                <div className={`flex items-center space-x-2 text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="bg-gray-600 px-2 py-0.5 rounded text-xs">{movieData.rating || 'PG-13'}</span>
                  <span>{movieData.year}</span>
                  <span>{movieData.duration}</span>
                  <span className="bg-red-600 px-2 py-0.5 rounded text-xs font-semibold">HD</span>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-2">
                <button className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full">
                  <Plus size={20} />
                </button>
                <button className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full">
                  <ThumbsUp size={20} />
                </button>
                <button className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full">
                  <Download size={20} />
                </button>
                <button className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-full">
                  <Share size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Play Button */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayPause}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-6 md:p-8 transition-all transform hover:scale-105"
            >
              <Play className="text-white ml-1" size={isMobile ? 32 : 48} />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 md:p-6 transition-all duration-300 ${controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div
              ref={progressBarRef}
              className="relative h-1 md:h-2 bg-white/30 rounded-full cursor-pointer group"
              onClick={handleProgressChange}
            >
              {/* Buffered Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-white/50 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Watched Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-red-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Progress Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-white text-sm mt-2">
              <span>{formatTime(videoRef.current?.currentTime)}</span>
              <span>-{formatTime(duration - (videoRef.current?.currentTime || 0))}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-gray-300 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={isMobile ? 24 : 32} />
                ) : isPlaying ? (
                  <Pause size={isMobile ? 24 : 32} />
                ) : (
                  <Play size={isMobile ? 24 : 32} />
                )}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <SkipBack size={isMobile ? 20 : 24} />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <SkipForward size={isMobile ? 20 : 24} />
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {React.createElement(getVolumeIcon(), { size: isMobile ? 20 : 24 })}
                </button>

                {!isMobile && (
                  <div className="w-16 md:w-20">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setVolume(val);
                        if (videoRef.current) {
                          videoRef.current.volume = val / 100;
                        }
                        if (val > 0 && isMuted) setIsMuted(false);
                      }}
                      className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="hidden md:block text-white hover:text-gray-300 transition-colors flex items-center md:-ml-32">
              <span className="text-xl font-semibold">{movieData.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              {/* Quality Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1"
                >
                  <Settings size={isMobile ? 18 : 20} />
                  {!isMobile && <span className="text-sm">{selectedQuality}</span>}
                </button>

                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[120px]">
                    {qualityOptions.map(quality => (
                      <button
                        key={quality}
                        onClick={() => {
                          setSelectedQuality(quality);
                          setShowQualityMenu(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${selectedQuality === quality
                          ? 'text-white bg-red-600'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize size={isMobile ? 18 : 20} />
                ) : (
                  <Maximize size={isMobile ? 18 : 20} />
                )}
              </button>

              {/* More Options (Mobile) */}
              {isMobile && (
                <div className="relative">
                  <button
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {showMoreOptions && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-lg py-2 min-w-[160px]">
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                        <Plus size={16} className="inline mr-2" />
                        Add to List
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                        <ThumbsUp size={16} className="inline mr-2" />
                        Rate
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                        <Share size={16} className="inline mr-2" />
                        Share
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Volume Slider */}
          {isMobile && showVolumeSlider && (
            <div className="mt-4 flex items-center space-x-3 bg-black/50 rounded-lg p-3">
              <VolumeX size={16} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val / 100;
                  }
                  if (val > 0 && isMuted) setIsMuted(false);
                }}
                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none"
                style={{
                  background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) 100%)`
                }}
              />
              <Volume2 size={16} className="text-gray-400" />
              <span className="text-white text-sm w-8 text-center">
                {Math.round(isMuted ? 0 : volume)}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Touch Hints */}
        {isMobile && !controlsVisible && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-white/60 px-6">
              <div className="mb-3">
                {orientation === 'portrait' ? (
                  <div className="space-y-2">
                    <p className="text-sm">Tap to show controls</p>
                    <p className="text-xs">Swipe ← → to seek</p>
                    <p className="text-xs">Swipe ↑ ↓ on right to adjust volume</p>
                  </div>
                ) : (
                  <div className="flex space-x-8 text-xs">
                    <div>← 10s</div>
                    <div>Tap to play</div>
                    <div>10s →</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;