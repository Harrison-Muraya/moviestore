<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    // public function movies()
    // {
    //     return $this->hasMany(Movie::class);
    // }
    protected $fillable = [
        'name', 'slug', 'description', 'color', 'icon', 'sort_order', 'status'
    ];

    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'genre_movie');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
