<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    protected $fillable = [
        'season_id', 'movie_id', 'episode_number', 'title', 'slug',
        'description', 'duration', 'thumbnail', 'video_path',
        'rating', 'air_date', 'status'
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'air_date' => 'date',
    ];

    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    public function movie()
    {
        return $this->belongsTo(Movie::class, 'tital');
    }

    public function getFormattedTitleAttribute()
    {
        return "S{$this->season->season_number}E{$this->episode_number}: {$this->title}";
    }
}
