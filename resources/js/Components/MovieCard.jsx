// const { defaultClientConditions } = require("vite")
import React from 'react';
import { Play, Info } from 'lucide-react';
import { Head, Link, useForm } from '@inertiajs/react';


const MovieCard = ({ movie, index, hoveredItem, setHoveredItem }) => {
    // console.log("Movie:", movie);
    return (
        <div
            className="relative flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-110 hover:z-10"
            onMouseEnter={() => setHoveredItem(`${movie.id}-${index}`)}
            onMouseLeave={() => setHoveredItem(null)}
        >
            <img
                src={movie.thumbnail?.startsWith('http') ? movie.thumbnail : `/storage/${movie.thumbnail}`}
                alt={movie.title}
                className="w-full h-full object-cover"
            />
            {hoveredItem === `${movie.id}-${index}` && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-end p-4 transition-opacity duration-300">
                    <h4 className="text-white font-bold text-sm mb-2 capitalize">{movie.title}</h4>
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
                    {/* Hover Play Button */}
                    <a href={route('newvideo.player', { id: movie.id })} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                    </a>
                </div>
            )}
        </div>
    )

}
export default MovieCard