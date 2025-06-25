import React, { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';

function MovieList() {

    const { props } = usePage();
    const [singleMovies, setSingleMovies] = useState([]);
    const [SeriesMovies, setSeriesMovies] = useState([]);

    const movies = props.movies || [];

    useEffect(() => {
        const singles = movies.filter(movie => movie.type === 'movie');
        const series = movies.filter(movie => movie.type === 'series');
        setSeriesMovies(series);
        setSingleMovies(singles);
    }, [movies]);

    console.log('Single Movies:', singleMovies);

    return (
        <div className="fixed inset-0 overflow-hidden bg-[url('/images/silence.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="absolute inset-0 bg-white bg-opacity-20 z-20 backdrop-blur-sm"></div>
            <div className="relative grid grid-flow-row px-32  z-30 overflow-auto h-screen">
                <div className="flex bg-white/20 backdrop-blur-sm p-2 mt-2 rounded-lg shadow-lg justify-center items-center">
                    <Link href={route('latestdashboard')} className="text-red-600 text-2xl md:text-4xl my-6 text-center font-semibold tracking-wider">
                        ALPHA <span className="text-red-600">.</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 mt-6 gap-x-5">
                    {/* Single Movies Section */}
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                        <p className="text-white text-xl md:text-4xl my-6 font-semibold tracking-wider">
                            Single Movies
                        </p>

                        <div className="card">
                            <ul>

                                {singleMovies.length > 0 ? (
                                    singleMovies.map((movie, index) => (
                                        <li
                                            key={movie.id || index}
                                            className="text-white text-lg bg-white/60 backdrop-blur-sm md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-md"
                                        >
                                            <Link href={route('newvideo.player', { id: movie.id })} className="flex flex-col md:flex-row">
                                                <div className="h-16 md:w-40 md:h-40">
                                                    <img
                                                        // src={movie.thumbnail}
                                                        src={movie.thumbnail?.startsWith('http') ? movie.thumbnail : `/storage/${movie.thumbnail}`}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                </div>
                                                <div className="justify-left ml-4">
                                                    <div className="flex flex-row ">
                                                        <span className="text-black text-lg md:text-2xl font-bold capitalize">
                                                            {movie.title}
                                                        </span>
                                                        <span className="bg-red-600 text-gray-100 text-sm  ml-2 rounded-md px-2 py-1">
                                                            {movie.genres[0]?.name || 'Unknown Genre'}
                                                        </span>
                                                    </div>
                                                    <div className="text-base text-black font-mono">
                                                        {movie.description || 'No description available.'}
                                                    </div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))
                                )
                                    : (
                                        <li className="text-white text-lg md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-sm">
                                            No movies available
                                        </li>
                                    )}
                            </ul>
                        </div>
                    </div>

                    {/* Series Movies Section */}
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                        <p className="text-white text-xl md:text-4xl my-6 font-semibold tracking-wider">
                            Series Movies
                        </p>

                        <div className="card">
                            <ul>

                                {SeriesMovies.length > 0 ? (
                                    SeriesMovies.map((movie, index) => (
                                        <li
                                            key={movie.id || index}
                                            className="text-white text-lg bg-white/60 backdrop-blur-sm md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-sm"
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                <div className="h-16 md:w-40 md:h-40">
                                                    <img
                                                        src={movie.thumbnail}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover rounded-md"
                                                    />
                                                </div>
                                                <div className="justify-left ml-4">
                                                    <div className="flex flex-row ">
                                                        <span className="text-black text-lg md:text-2xl font-bold capitalize">
                                                            {movie.title}
                                                        </span>
                                                        <span className="bg-indigo-600 text-gray-100 text-sm  ml-2 rounded-sm px-2 py-1">
                                                            {movie.genres[0]?.name || 'Unknown Genre'}
                                                        </span>
                                                    </div>
                                                    <div className="">Description</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                )
                                    : (
                                        <li className="text-white text-lg md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-sm">
                                            No movies available
                                        </li>
                                    )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default MovieList;