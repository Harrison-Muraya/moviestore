import React, { useState, useEffect } from 'react';

function AllMovies(){

    const [movies, setMovies] = useState([]);
    console.log(movies);

    return (
        <div>
            <h1>Edit Video</h1>
            <p>This is the video edit page.</p>
        </div>
    );
}

export default AllMovies;