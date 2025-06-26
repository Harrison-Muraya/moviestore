import React, { useRef, useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

const Hero = ({ randomMovie, isLoading = false , playlist}) => {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    // console.log("Random Movie from Hero:", randomMovie);
    // console.log('playlist at hero', randomMovie);

    // Early return if still loading or no movie data
    if (isLoading || !randomMovie) {
        return (
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
                <div className="text-white text-xl">Loading...</div>
            </section>
        );
    }

    const heroContent = {
        title: randomMovie.title || "Stranger Things",
        description: randomMovie.description ||
            "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
        // videoUrl: randomMovie.trailer_path?.startsWith('http') ? randomMovie.trailer_path : `/storage/${randomMovie.trailer_path}`
        videoUrl: randomMovie.video_path?.startsWith('http') ? randomMovie.video_path : `/storage/${randomMovie.video_path}`
    };
    

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // useEffect(() => {
    //     if (videoRef.current && heroContent.videoUrl) {
    //         videoRef.current.play().catch((err) => {
    //             console.log("Auto-play was prevented:", err);
    //         });
    //     }
    // }, [heroContent.videoUrl]);

    return (
        <section className="relative h-screen flex items-center overflow-hidden">
            {/* Background Video */}
            {heroContent.videoUrl && (
                <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                >
                    {/* <source src={randomMovie.thumbnail?.startsWith('http') ? randomMovie.thumbnail : `/storage/${randomMovie.thumbnail}`} type="video/mp4" /> */}
                    <source src={heroContent.videoUrl} type="video/mp4" />
                </video>
            )}

            {/* Fallback background if no video */}
            {!heroContent.videoUrl && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />

            {/* Mute/Unmute Button - Only show if there's a video */}
            {heroContent.videoUrl && (
                <button
                    onClick={toggleMute}
                    className="absolute top-1/2 right-8 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-80 text-white p-3 rounded-full transition-all duration-300 border border-white border-opacity-50 hover:border-opacity-100"
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            )}

            {/* Hero Text Content */}
            <div className="relative z-10 max-w-2xl px-4 ml-4">
                <h1 className="text-6xl font-bold mb-4 capitalize text-white">{heroContent.title}</h1>
                <p className="text-lg mb-8 leading-relaxed text-white">{heroContent.description}</p>

                <div  className="flex gap-4">
                    <a href={route('newvideo.player', { id: randomMovie.id })} className="bg-white text-black px-8 py-3 rounded flex items-center gap-2 font-semibold text-lg hover:bg-gray-200 transition-colors">
                        <Play size={24} />
                        Play
                    </a>
                    <button className="bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded flex items-center gap-2 font-semibold text-lg hover:bg-gray-500 hover:bg-opacity-70 transition-colors">
                        <Info size={24} />
                        More Info
                    </button>
                </div>

                {/* Age Rating and Genre Info */}
                <div className="mt-8 flex items-center gap-4 text-sm">
                    <span className="bg-red-600 px-2 py-1 rounded text-white font-bold">
                        {randomMovie.rating || "TV-14"}
                    </span>
                    <span className="text-white capitalize">
                        {/* {randomMovie.genres[0].name || "Sci-Fi • Drama • Thriller"} */}
                        {randomMovie?.genres?.map(g => g.name).join(' • ') || "Sci-Fi • Drama • Thriller"}
                    </span>
                    <span className="text-gray-300">
                        {randomMovie.year || "2016"}
                    </span>
                </div>
            </div>
        </section>
    );
};

export default Hero;