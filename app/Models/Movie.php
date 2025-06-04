<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
//     public function genre()
// {
//     return $this->belongsTo(Genre::class, 'name');
// }
    protected $fillable = [
        'title', 'genre_id', 'slug', 'duration', 'year', 'description',
        'thumbnail', 'trailer_path', 'video_path', 'cast', 'type', 'rating',
        'language', 'country', 'total_seasons', 'total_episodes', 'status'
    ];

    protected $casts = [
        'cast' => 'array',
        'rating' => 'decimal:1',
        'total_seasons' => 'integer',
        'total_episodes' => 'integer',
    ];

    // Relationships
    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    public function seasons()
    {
        return $this->hasMany(Season::class)->orderBy('season_number');
    }

    public function episodes()
    {
        return $this->hasMany(Episode::class);
    }

    // Scopes
    public function scopeMovies($query)
    {
        return $query->where('type', 'movie');
    }

    public function scopeSeries($query)
    {
        return $query->where('type', 'series');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    // Accessors
    public function getIsSeriesAttribute()
    {
        return $this->type === 'series';
    }

    public function getTotalDurationAttribute()
    {
        if ($this->type === 'movie') {
            return $this->duration;
        }
        
        return $this->episodes()->sum('duration');
    }

}
