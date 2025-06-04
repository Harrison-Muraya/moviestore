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

    const [genres, setGenres] = useState([
        { id: 1, name: 'Action' },
        { id: 2, name: 'Comedy' },
        { id: 3, name: 'Drama' },
        { id: 4, name: 'Horror' },
        { id: 5, name: 'Romance' },
        { id: 6, name: 'Sci-Fi' },
        { id: 7, name: 'Thriller' },
        { id: 8, name: 'Documentary' }
    ]);
    const [loading, setLoading] = useState(false);
    const [castInput, setCastInput] = useState('');
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleGenreChange = (genreId) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId]
        }));
    };

    const addCastMember = () => {
        if (castInput.trim()) {
            setFormData(prev => ({
                ...prev,
                cast: [...prev.cast, castInput.trim()]
            }));
            setCastInput('');
        }
    };

    const removeCastMember = (index) => {
        setFormData(prev => ({
            ...prev,
            cast: prev.cast.filter((_, i) => i !== index)
        }));
    };

    const addSeason = () => {
        const newSeason = {
            season_number: formData.seasons.length + 1,
            title: '',
            description: '',
            thumbnail: null,
            episodes: []
        };
        setFormData(prev => ({
            ...prev,
            seasons: [...prev.seasons, newSeason]
        }));
    };

    const updateSeason = (seasonIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            seasons: prev.seasons.map((season, index) =>
                index === seasonIndex ? { ...season, [field]: value } : season
            )
        }));
    };

    const removeSeason = (seasonIndex) => {
        setFormData(prev => ({
            ...prev,
            seasons: prev.seasons.filter((_, index) => index !== seasonIndex)
        }));
    };

    const addEpisode = (seasonIndex) => {
        const season = formData.seasons[seasonIndex];
        const newEpisode = {
            episode_number: season.episodes.length + 1,
            title: '',
            description: '',
            duration: '',
            video: null,
            thumbnail: null
        };

        updateSeason(seasonIndex, 'episodes', [...season.episodes, newEpisode]);
    };

    const updateEpisode = (seasonIndex, episodeIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            seasons: prev.seasons.map((season, sIndex) =>
                sIndex === seasonIndex ? {
                    ...season,
                    episodes: season.episodes.map((episode, eIndex) =>
                        eIndex === episodeIndex ? { ...episode, [field]: value } : episode
                    )
                } : season
            )
        }));
    };

    const removeEpisode = (seasonIndex, episodeIndex) => {
        setFormData(prev => ({
            ...prev,
            seasons: prev.seasons.map((season, sIndex) =>
                sIndex === seasonIndex ? {
                    ...season,
                    episodes: season.episodes.filter((_, eIndex) => eIndex !== episodeIndex)
                } : season
            )
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setErrors({});
        // --------------------------------------------------------

        const form = new FormData();

        form.append('title', formData.title);
        form.append('type', formData.type);
        form.append('description', formData.description);
        form.append('year', formData.year);
        form.append('language', formData.language);
        form.append('country', formData.country);
        form.append('rating', formData.rating);
        form.append('duration', formData.duration);

        // Add cast members
        formData.cast.forEach((actor, index) => {
            form.append(`cast[${index}]`, actor);
        });

        // Add selected genre IDs
        formData.genres.forEach((genreId, index) => {
            form.append(`genres[${index}]`, genreId);
        });

        // Files
        if (formData.thumbnail) form.append('thumbnail', formData.thumbnail);
        if (formData.trailer) form.append('trailer', formData.trailer);
        if (formData.video) form.append('video', formData.video);

        // Add seasons and episodes
        formData.seasons.forEach((season, sIndex) => {
            form.append(`seasons[${sIndex}][season_number]`, season.season_number);
            form.append(`seasons[${sIndex}][title]`, season.title);
            form.append(`seasons[${sIndex}][description]`, season.description);

            if (season.thumbnail) {
                form.append(`seasons[${sIndex}][thumbnail]`, season.thumbnail);
            }

            season.episodes.forEach((episode, eIndex) => {
                form.append(`seasons[${sIndex}][episodes][${eIndex}][episode_number]`, episode.episode_number);
                form.append(`seasons[${sIndex}][episodes][${eIndex}][title]`, episode.title);
                form.append(`seasons[${sIndex}][episodes][${eIndex}][description]`, episode.description);
                form.append(`seasons[${sIndex}][episodes][${eIndex}][duration]`, episode.duration);

                if (episode.thumbnail) {
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][thumbnail]`, episode.thumbnail);
                }
                if (episode.video) {
                    form.append(`seasons[${sIndex}][episodes][${eIndex}][video]`, episode.video);
                }
            });
        });

        try {
            await axios.post('/upload-content', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Content uploaded successfully!');
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
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert('Upload failed. Try again.');
            }
        } finally {
            setLoading(false);
        }

        // ----------------------------------------------------------
        // const response = await axios.post('/upload-content', form, {
        //     headers: {
        //         'Content-Type': 'multipart/form-data',
        //     },
        // });

        // Simulate API call
        // setTimeout(() => {
        //     alert('Content uploaded successfully!');
        //     setFormData({
        //         title: '',
        //         type: 'movie',
        //         genres: [],
        //         description: '',
        //         year: new Date().getFullYear(),
        //         language: 'en',
        //         country: '',
        //         rating: '',
        //         cast: [],
        //         duration: '',
        //         thumbnail: null,
        //         trailer: null,
        //         video: null,
        //         seasons: []
        //     });
        //     setLoading(false);
        // }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
                <p className="text-gray-600">Add movies or TV series with episodes</p>
            </div>

            <div className="space-y-8">
                {/* Content Type Selection */}
                <div className="bg-gray-50 p-6 rounded-lg">
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
                <div className="bg-gray-50 p-6 rounded-lg">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="inline mr-1" size={16} />
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                min="1900"
                                max={new Date().getFullYear() + 5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Globe className="inline mr-1" size={16} />
                                Language
                            </label>
                            <input
                                type="text"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {formData.type === 'movie' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="inline mr-1" size={16} />
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 120 min"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Star className="inline mr-1" size={16} />
                                Rating (0-10)
                            </label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                min="0"
                                max="10"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Genres */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Genres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {genres.map(genre => (
                            <label key={genre.id} className="flex items-center cursor-pointer">
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
                </div>

                {/* Cast */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Cast</h2>
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={castInput}
                            onChange={(e) => setCastInput(e.target.value)}
                            placeholder="Enter cast member name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCastMember())}
                        />
                        <button
                            type="button"
                            onClick={addCastMember}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                        >
                            <Plus size={16} className="mr-1" />
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.cast.map((member, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                                {member}
                                <button
                                    type="button"
                                    onClick={() => removeCastMember(index)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <Trash size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* File Uploads */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Upload className="mr-2" size={20} />
                        Media Files
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thumbnail *
                            </label>
                            <input
                                type="file"
                                name="thumbnail"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trailer
                            </label>
                            <input
                                type="file"
                                name="trailer"
                                onChange={handleFileChange}
                                accept="video/*"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {formData.type === 'movie' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video File *
                                </label>
                                <input
                                    type="file"
                                    name="video"
                                    onChange={handleFileChange}
                                    accept="video/*"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Seasons & Episodes (for TV Series) */}
                {formData.type === 'series' && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Tv className="mr-2" size={20} />
                                Seasons & Episodes
                            </h2>
                            <button
                                type="button"
                                onClick={addSeason}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
                            >
                                <Plus size={16} className="mr-1" />
                                Add Season
                            </button>
                        </div>

                        {formData.seasons.map((season, seasonIndex) => (
                            <div key={seasonIndex} className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">Season {season.season_number}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeSeason(seasonIndex)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Season Title
                                        </label>
                                        <input
                                            type="text"
                                            value={season.title}
                                            onChange={(e) => updateSeason(seasonIndex, 'title', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Season Thumbnail
                                        </label>
                                        <input
                                            type="file"
                                            onChange={(e) => updateSeason(seasonIndex, 'thumbnail', e.target.files[0])}
                                            accept="image/*"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Season Description
                                    </label>
                                    <textarea
                                        value={season.description}
                                        onChange={(e) => updateSeason(seasonIndex, 'description', e.target.value)}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">Episodes</h4>
                                        <button
                                            type="button"
                                            onClick={() => addEpisode(seasonIndex)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center"
                                        >
                                            <Plus size={14} className="mr-1" />
                                            Add Episode
                                        </button>
                                    </div>

                                    {season.episodes.map((episode, episodeIndex) => (
                                        <div key={episodeIndex} className="border border-gray-100 rounded p-3 mb-3 bg-gray-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-sm">Episode {episode.episode_number}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Episode Title
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={episode.title}
                                                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'title', e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Duration
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={episode.duration}
                                                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'duration', e.target.value)}
                                                        placeholder="e.g., 45 min"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Video File
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'video', e.target.files[0])}
                                                        accept="video/*"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Episode Thumbnail
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'thumbnail', e.target.files[0])}
                                                        accept="image/*"
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Episode Description
                                                </label>
                                                <textarea
                                                    value={episode.description}
                                                    onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'description', e.target.value)}
                                                    rows="2"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2" size={16} />
                                Upload Content
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContentUploadForm;