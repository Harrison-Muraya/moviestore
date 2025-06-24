import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';


const MovieRow = ({ category, rowIndex }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const rowRefs = useRef({});

        const scroll = (direction, rowIndex) => {
        const rowRef = rowRefs.current[rowIndex];
        if (rowRef) {
            const scrollAmount = 300;
            const currentScroll = rowRef.scrollLeft;
            const newPosition = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;

            rowRef.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
         <div className="px-4 md:px-12 group mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-white">
                {category.title}
            </h2>

            <div className="relative">
                <button
                    onClick={() => scroll('left', rowIndex)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 hover:scale-110"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div
                    ref={el => rowRefs.current[rowIndex] = el}
                    className="flex space-x-4 overflow-x-scroll scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {category.movies.map((movie, index) => (
                        <MovieCard key={movie.id}
                            movie={movie}
                            index={index}
                            hoveredItem={hoveredItem}
                            setHoveredItem={setHoveredItem} />
                    ))}
                </div>

                <button
                    onClick={() => scroll('right', rowIndex)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 hover:scale-110"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
export default MovieRow;