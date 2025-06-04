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
  const [loading, setLoading] = useState(false);
  const [castInput, setCastInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      const data = await response.json();
      setGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const submitData = new FormData();
    
    // Basic fields
    Object.keys(formData).forEach(key => {
      if (key === 'cast') {
        submitData.append('cast', JSON.stringify(formData.cast));
      } else if (key === 'genres') {
        formData.genres.forEach(genreId => {
          submitData.append('genres[]', genreId);
        });
      } else if (key === 'seasons') {
        // Handle seasons separately
      } else if (formData[key] !== null && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    // Handle seasons for series
    if (formData.type === 'series') {
      formData.seasons.forEach((season, seasonIndex) => {
        submitData.append(`seasons[${seasonIndex}][season_number]`, season.season_number);
        if (season.title) submitData.append(`seasons[${seasonIndex}][title]`, season.title);
        if (season.description) submitData.append(`seasons[${seasonIndex}][description]`, season.description);
        if (season.thumbnail) submitData.append(`seasons[${seasonIndex}][thumbnail]`, season.thumbnail);

        season.episodes.forEach((episode, episodeIndex) => {
          submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][episode_number]`, episode.episode_number);
          submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][title]`, episode.title);
          if (episode.description) submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][description]`, episode.description);
          if (episode.duration) submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][duration]`, episode.duration);
          if (episode.video) submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][video]`, episode.video);
          if (episode.thumbnail) submitData.append(`seasons[${seasonIndex}][episodes][${episodeIndex}][thumbnail]`, episode.thumbnail);
        });
      });
    }

    try {
      const response = await fetch('/api/content/upload', {
        method: 'POST',
        body: submitData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('Content uploaded successfully!');
        // Reset form or redirect
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
      } else {
        setErrors(result.errors || {});
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Content</h1>
        <p className="text-gray-600">Add movies or TV series with episodes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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
        <div className="bg-gray-50 p-6 rounded-lg"></div>