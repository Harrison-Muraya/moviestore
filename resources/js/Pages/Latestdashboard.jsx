import React, { useState, useRef, useEffect } from 'react';
import MovieRow from "@/Components/MovieRow";
import Header from "@/Components/Header";
import Hero from "@/Components/Hero";
import Footer from "@/Components/Footer";
import { usePage } from '@inertiajs/react';

const AlphaMovies = () => {
    const videoRef = useRef(null);
    const rowRefs = useRef({});

    const [randomMovie, setRandomMovie] = useState(null);

    // Initialize rowRefs for each movie category
    const { genre } = usePage().props;


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
                // console.log('Selected Movie aftre selecting genre:', selectedMovie);

                setRandomMovie(selectedMovie);
            }
        }
    }, [genre]);



    // console.log('randomMovie:', randomMovie);


    return (
        <div className="bg-black min-h-screen text-white">

            {/* Header */}
            <Header />

            {/* Hero Section */}
            <Hero randomMovie={randomMovie} />

            {/* Movie Rows */}
            <main className="relative z-10 -mt-36">
                {genre.map((category, id) => (
                    <MovieRow key={id} category={category} rowIndex={id} />
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
    );
};

export default AlphaMovies;