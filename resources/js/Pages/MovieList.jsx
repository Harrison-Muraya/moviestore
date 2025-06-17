import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

function MovieList() {

    const { props } = usePage();

    console.log(props);
    const movies = props.movies || [];

    // const [movies, setMovies] = useState([]);
    // console.log(movies);

    // movies.map((movie) => {
    //     console.log(movie);
    // });

    return (
        <>
            <div className="fixed bg-blue-300 h-screen w-full"></div>
        </>

    )
}

export default MovieList;