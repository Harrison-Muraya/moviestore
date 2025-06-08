import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash, Film, Tv, Star, Calendar, Globe, Clock } from 'lucide-react';

const ContentUploadForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        type: 'movie',
        genres: [],
        description: '',
        year: new Date().getFullYear(),
        language: 'en',
        country: '',
        rating: '',
        cast: [],
        duration: '',
        thumbnail: null,
        trailer: null,
        video: null,
        seasons: []
    });

    const [genres, setGenres] = useState([]);

    // Missing state variables
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [debugInfo, setDebugInfo] = useState('');

    // Load genres from API
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/genres');
                if (response.ok) {
                    const genresData = await response.json();
                    setGenres(genresData);
                }
            } catch (error) {
                console.log('Using hardcoded genres - API not available');
            }
        };
        fetchGenres();
    }, []);

    // Missing input change handler
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Missing file change handler
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    // Missing genre change handler
    const handleGenreChange = (genreId) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId]
        }));
    };

 

    const validateForm = () => {
        const newErrors = {};

        // Basic validation
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.genres.length === 0) newErrors.genres = 'At least one genre is required';

        if (formData.type === 'movie') {
            if (!formData.duration.trim()) newErrors.duration = 'Duration is required for movies';
            if (!formData.video) newErrors.video = 'Video file is required for movies';
        }

        if (formData.type === 'series') {
            if (formData.seasons.length === 0) {
                newErrors.seasons = 'At least one season is required for series';
            } else {
                formData.seasons.forEach((season, sIndex) => {
                    if (season.episodes.length === 0) {
                        newErrors[`season_${sIndex}_episodes`] = `Season ${sIndex + 1} must have at least one episode`;
                    } else {
                        season.episodes.forEach((episode, eIndex) => {
                            if (!episode.title.trim()) {
                                newErrors[`season_${sIndex}_episode_${eIndex}_title`] = `Episode ${eIndex + 1} title is required`;
                            }
                            if (!episode.video) {
                                newErrors[`season_${sIndex}_episode_${eIndex}_video`] = `Episode ${eIndex + 1} video is required`;
                            }
                        });
                    }
                });
            }
        }

        return newErrors;
    };

    // Helper function to get cookie value
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    const debugFormData = (form) => {
        let debug = 'FormData contents:\n';
        for (let [key, value] of form.entries()) {
            if (value instanceof File) {
                debug += `${key}: File(${value.name}, ${value.size} bytes, ${value.type})\n`;
            } else {
                debug += `${key}: ${value}\n`;
            }
        }
        return debug;
    };

    const handleSubmit = async () => {
        // Client-side validation
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            alert('Please fix the validation errors before submitting');
            return;
        }

        setLoading(true);
        setErrors({});
        setDebugInfo('');

        const form = new FormData();

        // Basic fields
        form.append('title', formData.title);
        form.append('type', formData.type);
        form.append('description', formData.description || '');
        form.append('year', formData.year.toString());
        form.append('language', formData.language);
        form.append('country', formData.country || '');
        form.append('rating', formData.rating || '');

        // Duration (for movies)
        if (formData.type === 'movie' && formData.duration) {
            form.append('duration', formData.duration);
        }

        // Cast members
        formData.cast.forEach((actor, index) => {
            if (actor.trim()) {
                form.append(`cast[${index}]`, actor);
            }
        });

        // Genres
        formData.genres.forEach((genreId, index) => {
            form.append(`genres[${index}]`, genreId.toString());
        });

        // Files
        if (formData.thumbnail) form.append('thumbnail', formData.thumbnail);
        if (formData.trailer) form.append('trailer', formData.trailer);
        if (formData.video && formData.type === 'movie') {
            form.append('video', formData.video);
        }

        // Seasons and episodes (for series)
        if (formData.type === 'series') {
            formData.seasons.forEach((season, sIndex) => {
                form.append(`seasons[${sIndex}][season_number]`, season.season_number.toString());
                form.append(`seasons[${sIndex}][title]`, season.title || '');
                form.append(`seasons[${sIndex}][description]`, season.description || '');

                if (season.thumbnail) {
                    form.append(`seasons[${sIndex}][thumbnail]`, season.thumbnail);
                }

                season.episodes.forEach((episode, eIndex) => {
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][episode_number]`, episode.episode_number.toString());
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][title]`, episode.title);
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][description]`, episode.description || '');
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][duration]`, episode.duration || '');

                    if (episode.thumbnail) {
                        form.append(`seasons[${sIndex}][episodes][${eIndex}][thumbnail]`, episode.thumbnail);
                    }
                    if (episode.video) {
                        form.append(`seasons[${sIndex}][episodes][${eIndex}][video]`, episode.video);
                    }
                });
            });
        }

        // Add CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            form.append('_token', csrfToken);
        }

        // Debug info
        const debugText = debugFormData(form);
        setDebugInfo(debugText);
        console.log(debugText);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
                getCookie('XSRF-TOKEN');

            const headers = {
                'Accept': 'application/json',
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/upload-content', {
                method: 'POST',
                body: form,
                headers: headers,
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server response:', errorData);

                if (response.status === 422 && errorData.errors) {
                    setErrors(errorData.errors);
                    alert('Validation failed. Check the errors below.');
                } else {
                    alert(`Upload failed: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const result = await response.json();
            alert('Content uploaded successfully!');

            // Reset form
            setFormData({
                title: '',
                type: 'movie',
                genres: [],
                description: '',
                year: new Date().getFullYear(),
                language: 'en',
                country: '',
                rating: '',
                cast: [],
                duration: '',
                thumbnail: null,
                trailer: null,
                video: null,
                seasons: []
            });

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-2 md:p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
                <p className="text-gray-600">Add movies or TV series with episodes</p>
            </div>

            {/* Content Type Selection */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Film className="mr-2" size={20} />
                    Content Type
                </h2>
                <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="movie"
                            checked={formData.type === 'movie'}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <Film className="mr-1" size={16} />
                        Movie
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            value="series"
                            checked={formData.type === 'series'}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        <Tv className="mr-1" size={16} />
                        TV Series
                    </label>
                </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter content title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>
                </div>
            </div>

            {/* Genres */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4">Genres *</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {genres.map(genre => (
                        <label key={genre.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.genres.includes(genre.id)}
                                onChange={() => handleGenreChange(genre.id)}
                                className="mr-2"
                            />
                            {genre.name}
                        </label>
                    ))}
                </div>
                {errors.genres && <p className="text-red-500 text-sm mt-1">{errors.genres}</p>}
            </div>

            {/* Cast */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Star className="mr-2" size={20} />
                    Cast Members
                </h2>
                {formData.cast.map((actor, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={actor}
                            onChange={(e) => updateCastMember(index, e.target.value)}
                            placeholder="Actor name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => removeCastMember(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addCastMember}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                >
                    <Plus size={16} />
                    Add Cast Member
                </button>
            </div>

            {/* Media Files */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Upload className="mr-2" size={20} />
                    Media Files
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Thumbnail</label>
                        <input
                            type="file"
                            name="thumbnail"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full border rounded-md px-3 py-2"
                        />
                        {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail}</p>}
                    </div>

                    {formData.type === 'movie' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-2">Trailer</label>
                                <input
                                    type="file"
                                    name="trailer"
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    className="w-full border rounded-md px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Video *</label>
                                <input
                                    type="file"
                                    name="video"
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    className="w-full border rounded-md px-3 py-2"
                                />
                                {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video}</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>


            {/* Debug Information */}
            {debugInfo && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-60">
                        {debugInfo}
                    </pre>
                </div>
            )}

            {/* Error Display */}
            {Object.keys(errors).length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-red-800 font-semibold mb-2">Validation Errors:</h3>
                    <ul className="text-red-700 text-sm">
                        {Object.entries(errors).map(([field, message]) => (
                            <li key={field} className="mb-1">
                                <strong>{field}:</strong> {Array.isArray(message) ? message.join(', ') : message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
                        Upload Content
                    </>
                )}
            </button>

        </div>
    );
};

export default ContentUploadForm;