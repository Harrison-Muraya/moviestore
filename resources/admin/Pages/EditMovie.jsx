import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Plus, Upload, X, Film, Tv, Save, ArrowLeft } from 'lucide-react';

export default function UpdateContent({ movie, genres }) {
    const [previewImages, setPreviewImages] = useState({});
    const [isDragOver, setIsDragOver] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        _method: 'PUT',
        title: movie.title || '',
        type: movie.type || 'movie',
        genres: movie.genres?.map(g => g.id) || [],
        description: movie.description || '',
        year: movie.year || new Date().getFullYear(),
        language: movie.language || 'en',
        country: movie.country || '',
        rating: movie.rating || '',
        cast: movie.cast || [''],
        duration: movie.duration || '',
        thumbnail: null,
        trailer: null,
        video: null,
        seasons: movie.seasons?.map(season => ({
            id: season.id,
            season_number: season.season_number,
            title: season.title || '',
            description: season.description || '',
            thumbnail: null,
            episodes: season.episodes?.map(episode => ({
                id: episode.id,
                episode_number: episode.episode_number,
                title: episode.title,
                description: episode.description || '',
                duration: episode.duration || '',
                video: null,
                thumbnail: null,
            })) || []
        })) || []
    });

    // Initialize preview images for existing content
    useEffect(() => {
        const initialPreviews = {};

        // Main thumbnail
        if (movie.thumbnail) {
            initialPreviews.main_thumbnail = `/storage/${movie.thumbnail}`;
        }

        // Season thumbnails
        movie.seasons?.forEach(season => {
            if (season.thumbnail) {
                initialPreviews[`season_${season.id}_thumbnail`] = `/storage/${season.thumbnail}`;
            }

            // Episode thumbnails
            season.episodes?.forEach(episode => {
                if (episode.thumbnail) {
                    initialPreviews[`episode_${episode.id}_thumbnail`] = `/storage/${episode.thumbnail}`;
                }
            });
        });

        setPreviewImages(initialPreviews);
    }, [movie]);

    const handleFilePreview = (file, key) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImages(prev => ({
                    ...prev,
                    [key]: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Add basic fields
        Object.keys(data).forEach(key => {
            if (key === 'seasons' || key === 'cast' || key === 'genres') return;

            if (data[key] !== null && data[key] !== '') {
                if (data[key] instanceof File) {
                    formData.append(key, data[key]);
                } else {
                    formData.append(key, data[key]);
                }
            }
        });

        // Add cast array
        data.cast.forEach((castMember, index) => {
            if (castMember.trim()) {
                formData.append(`cast[${index}]`, castMember);
            }
        });

        // Add genres array
        data.genres.forEach((genreId, index) => {
            formData.append(`genres[${index}]`, genreId);
        });

        // Add seasons data for series
        if (data.type === 'series') {
            data.seasons.forEach((season, seasonIndex) => {
                // Season basic fields
                if (season.id) formData.append(`seasons[${seasonIndex}][id]`, season.id);
                if (season.delete) formData.append(`seasons[${seasonIndex}][delete]`, season.delete);
                formData.append(`seasons[${seasonIndex}][season_number]`, season.season_number);
                if (season.title) formData.append(`seasons[${seasonIndex}][title]`, season.title);
                if (season.description) formData.append(`seasons[${seasonIndex}][description]`, season.description);
                if (season.thumbnail) formData.append(`seasons[${seasonIndex}][thumbnail]`, season.thumbnail);

                // Episodes
                season.episodes.forEach((episode, episodeIndex) => {
                    if (episode.id) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][id]`, episode.id);
                    if (episode.delete) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][delete]`, episode.delete);
                    formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][episode_number]`, episode.episode_number);
                    formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][title]`, episode.title);
                    if (episode.description) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][description]`, episode.description);
                    if (episode.duration) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][duration]`, episode.duration);
                    if (episode.video) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][video]`, episode.video);
                    if (episode.thumbnail) formData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][thumbnail]`, episode.thumbnail);
                });
            });
        }

        router.post(route('admin.update', movie.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                alert('Content updated successfully!');
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
            }
        });
    };

    const addCastMember = () => {
        setData('cast', [...data.cast, '']);
    };

    const removeCastMember = (index) => {
        setData('cast', data.cast.filter((_, i) => i !== index));
    };

    const addSeason = () => {
        const newSeason = {
            season_number: data.seasons.length + 1,
            title: '',
            description: '',
            thumbnail: null,
            episodes: []
        };
        setData('seasons', [...data.seasons, newSeason]);
    };

    const removeSeason = (index) => {
        const updatedSeasons = [...data.seasons];
        if (updatedSeasons[index].id) {
            // Mark for deletion if it exists in database
            updatedSeasons[index].delete = true;
        } else {
            // Remove completely if it's new
            updatedSeasons.splice(index, 1);
        }
        setData('seasons', updatedSeasons);
    };

    const addEpisode = (seasonIndex) => {
        const updatedSeasons = [...data.seasons];
        const newEpisode = {
            episode_number: updatedSeasons[seasonIndex].episodes.length + 1,
            title: '',
            description: '',
            duration: '',
            video: null,
            thumbnail: null,
        };
        updatedSeasons[seasonIndex].episodes.push(newEpisode);
        setData('seasons', updatedSeasons);
    };

    const removeEpisode = (seasonIndex, episodeIndex) => {
        const updatedSeasons = [...data.seasons];
        if (updatedSeasons[seasonIndex].episodes[episodeIndex].id) {
            // Mark for deletion if it exists in database
            updatedSeasons[seasonIndex].episodes[episodeIndex].delete = true;
        } else {
            // Remove completely if it's new
            updatedSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
        }
        setData('seasons', updatedSeasons);
    };

    const FileUploadZone = ({ onDrop, accept, children, className = '' }) => {
        const handleDragOver = (e) => {
            e.preventDefault();
            setIsDragOver(true);
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            setIsDragOver(false);
        };

        const handleDrop = (e) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0 && accept.includes(files[0].type)) {
                onDrop(files[0]);
            }
        };

        return (
            <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    } ${className}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {children}
            </div>
        );
    };

    return (
        <>
            <Head title={`Update ${movie.title}`} />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            // href={route('movies.edit.list')}
                            onClick={() => router.get(route('movies.edit.list'))}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Content List
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            {data.type === 'movie' ? <Film className="w-8 h-8 mr-3" /> : <Tv className="w-8 h-8 mr-3" />}
                            Update {data.type === 'movie' ? 'Movie' : 'Series'}
                        </h1>
                        <p className="text-gray-600 mt-2">Update your content information and media files</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Basic Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter title"
                                    />
                                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="movie">Movie</option>
                                        <option value="series">Series</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="1900"
                                        max={new Date().getFullYear() + 5}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating (0-10)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.rating}
                                        onChange={(e) => setData('rating', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Language
                                    </label>
                                    <input
                                        type="text"
                                        value={data.language}
                                        onChange={(e) => setData('language', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., en, es, fr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={data.country}
                                        onChange={(e) => setData('country', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., USA, UK, France"
                                    />
                                </div>
                            </div>

                            {data.type === 'movie' && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 2h 30min"
                                    />
                                </div>
                            )}

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter description"
                                />
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Genres</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {genres.map((genre) => (
                                    <label key={genre.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.genres.includes(genre.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setData('genres', [...data.genres, genre.id]);
                                                } else {
                                                    setData('genres', data.genres.filter(id => id !== genre.id));
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{genre.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Cast */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Cast Members</h2>
                            {data.cast.map((member, index) => (
                                <div key={index} className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={member}
                                        onChange={(e) => {
                                            const newCast = [...data.cast];
                                            newCast[index] = e.target.value;
                                            setData('cast', newCast);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Actor/Actress name"
                                    />
                                    {data.cast.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeCastMember(index)}
                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addCastMember}
                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Cast Member
                            </button>
                        </div>

                        {/* Media Files */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">Media Files</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Thumbnail */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Thumbnail
                                    </label>
                                    <FileUploadZone
                                        accept={['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']}
                                        onDrop={(file) => {
                                            setData('thumbnail', file);
                                            handleFilePreview(file, 'main_thumbnail');
                                        }}
                                    >
                                        {previewImages.main_thumbnail ? (
                                            <div className="relative">
                                                <img
                                                    src={previewImages.main_thumbnail}
                                                    alt="Thumbnail preview"
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Upload className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">Click or drag to upload thumbnail</p>
                                            </>
                                        )}
                                    </FileUploadZone>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setData('thumbnail', file);
                                                handleFilePreview(file, 'main_thumbnail');
                                            }
                                        }}
                                        className="hidden"
                                        id="thumbnail-upload"
                                    />
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                    >
                                        Choose File
                                    </label>
                                </div>

                                {/* Trailer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trailer (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setData('trailer', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Movie video */}
                            {data.type === 'movie' && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Movie Video
                                    </label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => setData('video', e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Series Seasons */}
                        {data.type === 'series' && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800">Seasons</h2>
                                    <button
                                        type="button"
                                        onClick={addSeason}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Season
                                    </button>
                                </div>

                                {data.seasons.filter(season => !season.delete).map((season, seasonIndex) => (
                                    <div key={seasonIndex} className="mb-8 p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-800">
                                                Season {season.season_number}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => removeSeason(seasonIndex)}
                                                className="text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Season Number
                                                </label>
                                                <input
                                                    type="number"
                                                    value={season.season_number}
                                                    onChange={(e) => {
                                                        const updatedSeasons = [...data.seasons];
                                                        updatedSeasons[seasonIndex].season_number = parseInt(e.target.value);
                                                        setData('seasons', updatedSeasons);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    min="1"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Season Title (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={season.title}
                                                    onChange={(e) => {
                                                        const updatedSeasons = [...data.seasons];
                                                        updatedSeasons[seasonIndex].title = e.target.value;
                                                        setData('seasons', updatedSeasons);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Season title"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Season Description (Optional)
                                            </label>
                                            <textarea
                                                value={season.description}
                                                onChange={(e) => {
                                                    const updatedSeasons = [...data.seasons];
                                                    updatedSeasons[seasonIndex].description = e.target.value;
                                                    setData('seasons', updatedSeasons);
                                                }}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Season description"
                                            />
                                        </div>

                                        {/* Season thumbnail */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Season Thumbnail (Optional)
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const updatedSeasons = [...data.seasons];
                                                        updatedSeasons[seasonIndex].thumbnail = file;
                                                        setData('seasons', updatedSeasons);
                                                        handleFilePreview(file, `season_${season.id || seasonIndex}_thumbnail`);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {previewImages[`season_${season.id || seasonIndex}_thumbnail`] && (
                                                <img
                                                    src={previewImages[`season_${season.id || seasonIndex}_thumbnail`]}
                                                    alt="Season thumbnail"
                                                    className="mt-2 w-24 h-16 object-cover rounded"
                                                />
                                            )}
                                        </div>

                                        {/* Episodes */}
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-md font-medium text-gray-700">Episodes</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => addEpisode(seasonIndex)}
                                                    className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Episode
                                                </button>
                                            </div>

                                            {season.episodes.filter(episode => !episode.delete).map((episode, episodeIndex) => (
                                                <div key={episodeIndex} className="mb-4 p-3 bg-gray-50 rounded border">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h5 className="font-medium text-gray-700">
                                                            Episode {episode.episode_number}
                                                        </h5>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                                                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Episode Number
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={episode.episode_number}
                                                                onChange={(e) => {
                                                                    const updatedSeasons = [...data.seasons];
                                                                    updatedSeasons[seasonIndex].episodes[episodeIndex].episode_number = parseInt(e.target.value);
                                                                    setData('seasons', updatedSeasons);
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                min="1"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Title *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={episode.title}
                                                                onChange={(e) => {
                                                                    const updatedSeasons = [...data.seasons];
                                                                    updatedSeasons[seasonIndex].episodes[episodeIndex].title = e.target.value;
                                                                    setData('seasons', updatedSeasons);
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Episode title"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Duration
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={episode.duration}
                                                                onChange={(e) => {
                                                                    const updatedSeasons = [...data.seasons];
                                                                    updatedSeasons[seasonIndex].episodes[episodeIndex].duration = e.target.value;
                                                                    setData('seasons', updatedSeasons);
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                placeholder="e.g., 45min"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={episode.description}
                                                            onChange={(e) => {
                                                                const updatedSeasons = [...data.seasons];
                                                                updatedSeasons[seasonIndex].episodes[episodeIndex].description = e.target.value;
                                                                setData('seasons', updatedSeasons);
                                                            }}
                                                            rows={2}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            placeholder="Episode description"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Episode Video {!episode.id && '*'}
                                                            </label>
                                                            <input
                                                                type="file"
                                                                accept="video/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const updatedSeasons = [...data.seasons];
                                                                        updatedSeasons[seasonIndex].episodes[episodeIndex].video = file;
                                                                        setData('seasons', updatedSeasons);
                                                                    }
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            />
                                                            {episode.id && !episode.video && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Current video will be kept if no new file is selected
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                Episode Thumbnail
                                                            </label>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        const updatedSeasons = [...data.seasons];
                                                                        updatedSeasons[seasonIndex].episodes[episodeIndex].thumbnail = file;
                                                                        setData('seasons', updatedSeasons);
                                                                        handleFilePreview(file, `episode_${episode.id || `${seasonIndex}_${episodeIndex}`}_thumbnail`);
                                                                    }
                                                                }}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            />
                                                            {previewImages[`episode_${episode.id || `${seasonIndex}_${episodeIndex}`}_thumbnail`] && (
                                                                <img
                                                                    src={previewImages[`episode_${episode.id || `${seasonIndex}_${episodeIndex}`}_thumbnail`]}
                                                                    alt="Episode thumbnail"
                                                                    className="mt-1 w-16 h-10 object-cover rounded"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {season.episodes.filter(episode => !episode.delete).length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No episodes added yet</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => addEpisode(seasonIndex)}
                                                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                                                    >
                                                        Add First Episode
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {data.seasons.filter(season => !season.delete).length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        <Tv className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium mb-2">No seasons added yet</p>
                                        <p className="mb-4">Add your first season to get started</p>
                                        <button
                                            type="button"
                                            onClick={addSeason}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Add First Season
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t">
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => router.get(route('movies.edit.list'))}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update {data.type === 'movie' ? 'Movie' : 'Series'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <X className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium">There were errors with your submission</h3>
                                    <div className="mt-2 text-sm">
                                        <ul className="list-disc list-inside space-y-1">
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )

}