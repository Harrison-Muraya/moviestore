import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function MovieList() {

    const { props } = usePage();
    console.log(props);
    const movies = props.movies || [];


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
                    <div className="text-center bg-red-300 mt-4">hello</div>

                </div>

            </div>
        </>

    )
}

export default MovieList;