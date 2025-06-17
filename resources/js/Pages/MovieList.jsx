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
                <div className="relative container bg-red-50 z-30 mx-auto">

                </div>

            </div>
        </>

    )
}

export default MovieList;