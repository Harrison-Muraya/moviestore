import React, { useRef, useState, useEffect } from 'react';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

const Hero = () => {

    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    return (
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
    )
}