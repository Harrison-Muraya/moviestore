import React, { useState, useEffect } from 'react';
import { usePage, Link, router } from '@inertiajs/react';

function MovieList() {
    const { props } = usePage();
    const [singleMovies, setSingleMovies] = useState([]);
    const [seriesMovies, setSeriesMovies] = useState([]);
    const [deletingId, setDeletingId] = useState(null);

    const movies = props.movies || [];

    useEffect(() => {
        const singles = movies.filter(movie => movie.type === 'movie');
        const series = movies.filter(movie => movie.type === 'series');
        setSeriesMovies(series);
        setSingleMovies(singles);
    }, [movies]);

    const handleDelete = async (movieId, e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get movie title for confirmation
        const movie = movies.find(m => m.id === movieId);
        const movieTitle = movie ? movie.title : 'this item';

        // Show confirmation dialog
        const isConfirmed = window.confirm(
            `Are you sure you want to delete "${movieTitle}"?\n\nThis action cannot be undone and will permanently remove all associated files, seasons, and episodes.`
        );

        if (!isConfirmed) return;

        try {
            setDeletingId(movieId);

            // Make delete request using Inertia router
            router.delete(`/admin/delete/movies/${movieId}`, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Handle success response
                    console.log('Movie deleted successfully');
                    
                    // Update local state to remove deleted movie
                    const updatedMovies = movies.filter(movie => movie.id !== movieId);
                    const updatedSingles = updatedMovies.filter(movie => movie.type === 'movie');
                    const updatedSeries = updatedMovies.filter(movie => movie.type === 'series');
                    setSingleMovies(updatedSingles);
                    setSeriesMovies(updatedSeries);
                },
                onError: (errors) => {
                    // Handle error response
                    console.error('Delete error:', errors);
                    alert('Failed to delete content. Please try again.');
                },
                onFinish: () => {
                    // Reset loading state
                    setDeletingId(null);
                }
            });

        } catch (error) {
            console.error('Delete request failed:', error);
            alert('Failed to delete content. Please try again.');
            setDeletingId(null);
        }
    };

    // Alternative using fetch API if you prefer
    // const handleDeleteWithFetch = async (movieId, e) => {
    //     e.preventDefault();
    //     e.stopPropagation();

    //     const movie = movies.find(m => m.id === movieId);
    //     const movieTitle = movie ? movie.title : 'this item';

    //     const isConfirmed = window.confirm(
    //         `Are you sure you want to delete "${movieTitle}"?\n\nThis action cannot be undone and will permanently remove all associated files, seasons, and episodes.`
    //     );

    //     if (!isConfirmed) return;

    //     try {
    //         setDeletingId(movieId);

    //         const response = await fetch(`/delete/movies/${movieId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
    //                 'Accept': 'application/json',
    //             },
    //         });

    //         const result = await response.json();

    //         if (result.success) {
    //             // Update local state to remove deleted movie
    //             const updatedSingles = singleMovies.filter(movie => movie.id !== movieId);
    //             const updatedSeries = seriesMovies.filter(movie => movie.id !== movieId);
    //             setSingleMovies(updatedSingles);
    //             setSeriesMovies(updatedSeries);
                
    //             alert(result.message);
    //         } else {
    //             alert(result.message || 'Failed to delete content');
    //         }

    //     } catch (error) {
    //         console.error('Delete request failed:', error);
    //         alert('Failed to delete content. Please try again.');
    //     } finally {
    //         setDeletingId(null);
    //     }
    // };

    return (
        <div className="fixed inset-0 overflow-hidden bg-[url('/images/silence.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="absolute inset-0 bg-black bg-opacity-20 z-20 backdrop-blur-sm"></div>
            <div className="relative grid grid-flow-row px-4 sm:px-8 lg:px-32 z-30 overflow-auto h-screen">
                <div className="flex bg-white/20 backdrop-blur-sm p-2 mt-2 rounded-lg shadow-lg justify-center items-center">
                    <Link href={route('admin.dashboard')} className="text-red-600 text-2xl md:text-4xl my-6 text-center font-semibold tracking-wider">
                        ALPHA <span className="text-red-600">.</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 mt-6 gap-5">
                    {/* Single Movies Section */}
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <p className="text-white text-xl md:text-3xl my-6 font-semibold tracking-wider">
                            Single Movies ({singleMovies.length})
                        </p>

                        <div className="space-y-4">
                            {singleMovies.length > 0 ? (
                                singleMovies.map((movie, index) => (
                                    <div
                                        key={movie.id || index}
                                        className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row gap-4 relative">
                                            {/* Movie Image */}
                                            <Link href={route('newvideo.player', { id: movie.id })} className="flex-shrink-0">
                                                <div className="w-full md:w-40 h-32 md:h-40">
                                                    <img
                                                        src={movie.thumbnail?.startsWith('http') ? movie.thumbnail : `/storage/${movie.thumbnail}`}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover rounded-md"
                                                        onError={(e) => {
                                                            e.target.src = '/images/default-thumbnail.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </Link>

                                            {/* Movie Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={route('newvideo.player', { id: movie.id })} className="block">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="text-black text-lg md:text-xl font-bold capitalize truncate">
                                                            {movie.title}
                                                        </h3>
                                                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                                            {movie.genres?.[0]?.name || 'Unknown Genre'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm md:text-base line-clamp-3">
                                                        {movie.description || 'No description available.'}
                                                    </p>
                                                </Link>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 md:absolute md:top-0 md:right-0">
                                                <Link
                                                    href={route('admin.edit', movie.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-1 text-center transition-colors"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    onClick={(e) => handleDelete(movie.id, e)}
                                                    disabled={deletingId === movie.id}
                                                    className={`${deletingId === movie.id ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} 
                                                            text-white text-sm rounded-md px-3 py-1 transition-colors
                                                            flex items-center justify-center gap-1
                                                        `}
                                                >
                                                    {deletingId === movie.id ? (
                                                        <>
                                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        'Delete'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg text-center">
                                    <p className="text-gray-700 text-lg font-medium">No single movies available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Series Movies Section */}
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                        <p className="text-white text-xl md:text-3xl my-6 font-semibold tracking-wider">
                            Series Movies ({seriesMovies.length})
                        </p>

                        <div className="space-y-4">
                            {seriesMovies.length > 0 ? (
                                seriesMovies.map((movie, index) => (
                                    <div
                                        key={movie.id || index}
                                        className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row gap-4 relative">
                                            {/* Movie Image */}
                                            <Link href={route('newvideo.player', { id: movie.id })} className="flex-shrink-0">
                                                <div className="w-full md:w-40 h-32 md:h-40">
                                                    <img
                                                        src={movie.thumbnail?.startsWith('http') ? movie.thumbnail : `/storage/${movie.thumbnail}`}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover rounded-md"
                                                        onError={(e) => {
                                                            e.target.src = '/images/default-thumbnail.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </Link>

                                            {/* Movie Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={route('newvideo.player', { id: movie.id })} className="block">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="text-black text-lg md:text-xl font-bold capitalize truncate">
                                                            {movie.title}
                                                        </h3>
                                                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                                            {movie.genres?.[0]?.name || 'Unknown Genre'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm md:text-base line-clamp-3">
                                                        {movie.description || 'No description available.'}
                                                    </p>
                                                </Link>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 md:absolute md:top-0 md:right-0">
                                                <Link
                                                    href={route('admin.edit', movie.id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md px-3 py-1 text-center transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                                
                                                <button
                                                    onClick={(e) => handleDelete(movie.id, e)}
                                                    disabled={deletingId === movie.id}
                                                    className={`${deletingId === movie.id ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} 
                                                            text-white text-sm rounded-md px-3 py-1 transition-colors
                                                            flex items-center justify-center gap-1
                                                        `}
                                                >
                                                    {deletingId === movie.id ? (
                                                        <>
                                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        'Delete'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg text-center">
                                    <p className="text-gray-700 text-lg font-medium">No series movies available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MovieList;