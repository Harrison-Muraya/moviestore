<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Season extends Model
{
    protected $fillable = [
        'movie_id', 'season_number', 'title', 'description',
        'thumbnail', 'year', 'total_episodes', 'status'
    ];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }

    public function episodes()
    {
        return $this->hasMany(Episode::class)->orderBy('episode_number');
    }

    public function getFormattedTitleAttribute()
    {
        return $this->title ?: "Season {$this->season_number}";
    }
}
