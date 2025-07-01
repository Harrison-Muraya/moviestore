import React, { useState, useRef, useEffect } from 'react';
import MovieRow from "@/Components/MovieRow";
import Header from "@/Components/Header";
import Hero from "@/Components/Hero";
import Footer from "@/Components/Footer";
import { Head, usePage } from '@inertiajs/react';


const AlphaMovies = () => {
    const videoRef = useRef(null);
    const rowRefs = useRef({});

    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
    const [randomMovie, setRandomMovie] = useState(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    const handleClose = () => { // Add missing function
        setIsPlayerOpen(false);
    };
    // Initialize rowRefs for each movie category
    const { genre, } = usePage().props;
    const { playlist, } = usePage().props;

    const handleVideoChange = (newMovie, newIndex) => {
        setCurrentMovieIndex(newIndex);
        // You might also want to update URL or other state here
    };

    // const [moviePlaylist, setMoviePlaylist] = useState([
    //     // Your movies array
    //     { id: 1, title: "Movie 1", video_path: "path1.mp4", year: "2024", duration: "2h 15m" },
    //     { id: 2, title: "Movie 2", video_path: "path2.mp4", year: "2024", duration: "1h 45m" },
    //     // ... more movies
    // ]);

    // const [moviePlaylist, setMoviePlaylist] = useState([playlist])


    // this picks a random movie from the genre list
    // and sets it to the randomMovie state
    useEffect(() => {
        if (genre.length > 0) {
            // Pick a random genre
            // const randomGenreIndex = Math.floor(Math.random() * genre.length);
            // const selectedGenre = genre[randomGenreIndex];
            const selectedGenre = genre[0];
            // console.log('Selected Genre:', selectedGenre);

            // Check if the selected genre has movies
            if (selectedGenre.movies.length > 0) {
                // Pick a random movie from that genre
                const randomMovieIndex = Math.floor(Math.random() * selectedGenre.movies.length);
                const selectedMovie = selectedGenre.movies[randomMovieIndex];
                // console.log('Selected Movie aftre selecting genre:', selectedMovie.id);
                setRandomMovie(selectedMovie);
            }
        }
    }, [genre]);

    // if (!genre || !playlist) {
    //     return <div className="bg-black min-h-screen text-white">Loading...</div>;
    // }

    // console.log('randomMovie:', randomMovie);

    return (
        <>
            <Head title="Alpha - Dashboard" />
            <div className="bg-black min-h-screen text-white">
                {/* Header */}
                <Header />

                {/* Hero Section */}
                {/* <Hero randomMovie={randomMovie} /> */}

                {/* Hero Section - only render when randomMovie is available */}
                {randomMovie && <Hero randomMovie={randomMovie} />}

                {/* Movie Rows */}
                <main className="relative z-10 -mt-36">
                    {genre.map((category, id) => (
                        <MovieRow key={id}
                            category={category}
                            playlist={playlist}
                            movie={randomMovie}
                            currentIndex={currentMovieIndex}
                            onVideoChange={handleVideoChange}
                            onClose={handleClose}
                            autoPlayNext={true}
                            isOpen={isPlayerOpen}
                            rowIndex={id}
                        />
                    ))}
                </main>

                {/* Footer */}
                <Footer />

                <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
            </div>
        </>
    );
};

export default AlphaMovies;