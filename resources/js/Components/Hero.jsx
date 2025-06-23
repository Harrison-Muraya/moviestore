import { useState } from 'react';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoPlayer from './VideoPlayer';

const Hero = ({ movie }) => {
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const title = movie.title || movie.name;

  console.log('Hero component rendered with movie:', movie.thumbnail);

  const imageUrl = `${movie.thumbnail?.startsWith('http') ? movie.thumbnail : `/storage/${movie.thumbnail}`}`;

  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const handlePlayClick = () => {
    setIsVideoPlayerOpen(true);
  };

  return (
    <>
      <div className="relative h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative z-10 px-4 md:px-12 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {movie.overview}
          </p>

          <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={handlePlayClick}
              className="bg-white text-black hover:bg-gray-200 transition-all duration-200 px-8 py-3 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Play
            </Button>
            <Button variant="outline" className="border-gray-400 text-white hover:bg-white hover:text-black transition-all duration-200 px-8 py-3 text-lg font-semibold">
              <Info className="w-5 h-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      <VideoPlayer
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
        videoUrl={videoUrl}
        title={title || 'Unknown Title'}
      />
    </>
  );
};

export default Hero;

