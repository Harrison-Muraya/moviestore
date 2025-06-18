import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function MovieList() {

    const { props } = usePage();
    // console.log(props);
    const movies = props.movies || [];
    const user = props.testing || []

    // console.log("user", user);


    return (
        <>
            <div className="relative bg-[url('/images/silence.jpg')]  h-screen bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-white bg-opacity-20 z-20 backdrop-blur-sm"></div>
                <div className="relative container grid grid-flow-row z-30 mx-auto">
                    <div className="bg-white/20 backdrop-blur-sm p-2 md:p-2 rounded-lg shadow-lg">
                        <p className="text-indigo-600 text-2xl md:text-4xl my-6 text-center m font-semibold tracking-wider">
                            ALPHA <span className="text-red-600">.</span>
                        </p>
                    </div>
                    <div className="grid grid-cols-2 mt-6 gap-x-5">
                        <div className="grid grid-row bg-white/20 backdrop-blur-sm p-2 md:p-2 rounded-lg shadow-lg">
                            <p className="text-white text-xl md:text-4xl my-6 font-semibold tracking-wider">
                                Singles
                            </p>
                            <div className="card">
                                <ul>
                                    {movies.map((movie, index) => (
                                        <li key={index} className="text-white text-lg bg-black/40 backdrop-blur-sm md:text-2xl p-2 my-6 font-semibold tracking-wider rounded-sm">
                                            {movie.title}
                                        </li>
                                    ))}
                                    <li className="text-white text-lg bg-white/20 backdrop-blur-sm md:text-2xl my-6 font-semibold tracking-wider rounded-sm"></li>
                                </ul>
                                                               
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-2 md:p-2 rounded-lg shadow-lg">hello</div>
                    </div>

                </div>

            </div>
        </>

    )
}

export default MovieList;