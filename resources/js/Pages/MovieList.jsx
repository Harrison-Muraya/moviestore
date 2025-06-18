import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function MovieList() {

    const { props } = usePage();
    // console.log(props);
    const movies = props.movies || [];
    const user = props.testing || []

    console.log("Movies:", movies);


    return (
        <div className="fixed inset-0 overflow-hidden bg-[url('/images/silence.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="absolute inset-0 bg-white bg-opacity-20 z-20 backdrop-blur-sm"></div>

            <div className="relative container grid grid-flow-row z-30 mx-auto overflow-auto h-screen">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                    <p className="text-indigo-600 text-2xl md:text-4xl my-6 text-center font-semibold tracking-wider">
                        ALPHA <span className="text-red-600">.</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 mt-6 gap-x-5">
                    <div className="grid grid-row bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                        <p className="text-white text-xl md:text-4xl my-6 font-semibold tracking-wider">
                            Singles
                        </p>

                        <div className="card">
                            <ul>
                                {movies.map((movie, index) => (
                                    <li
                                        key={index}
                                        className="text-white text-lg bg-black/40 backdrop-blur-sm md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-sm"
                                    >
                                        <div className="grid grid-cols-2">
                                            <div className="w-16 h-16 md:w-40 md:h-40">
                                                <img
                                                    src={movie.thumbnail}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <span className="text-red-600 text-lg md:text-2xl font-bold">
                                                    {movie.title}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg shadow-lg">hello</div>
                </div>
            </div>
        </div>
    );

}

export default MovieList;