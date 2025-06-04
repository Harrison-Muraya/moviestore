<?php

namespace Database\Seeders;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class MovieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
       public function run(): void
    {
        $adventure = Genre::where('name', 'Adventure')->first();
        $drama     = Genre::where('name', 'Drama')->first();
        $comedy    = Genre::where('name', 'Comedy')->first();
        $sciFi     = Genre::where('name', 'Sci-Fi')->first();

        Movie::create([
            'title' => "Ocean's Mystery",
            'genre_id' => $adventure->id,
            'slug' => 'oceans-mystery',
            'duration' => '1h 48m',
            'year' => '2024',
            'description' => "Deep beneath the waves lies a secret that could change everything.",
            'thumbnail' => 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=400&fit=crop',
            'video_path' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'cast' => json_encode(["Zendaya", "Timothée Chalamet", "Oscar Isaac"]),
        ]);

        Movie::create([
            'title' => "Life in Shadows",
            'genre_id' => $drama->id,
            'slug' => 'life-in-shadows',
            'duration' => '2h 5m',
            'year' => '2023',
            'description' => "A gripping tale of survival and identity in a fractured world.",
            'thumbnail' => 'https://images.unsplash.com/photo-1581905764498-dfde6241f4e4?w=300&h=400&fit=crop',
            'video_path' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'cast' => json_encode(["Denzel Washington", "Viola Davis"]),
        ]);

        Movie::create([
            'title' => "The Funny Bone",
            'genre_id' => $comedy->id,
            'slug' => 'the-funny-bone',
            'duration' => '1h 30m',
            'year' => '2022',
            'description' => "A hilarious journey through everyday chaos.",
            'thumbnail' => 'https://images.unsplash.com/photo-1618354691320-b94d66287879?w=300&h=400&fit=crop',
            'video_path' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'cast' => json_encode(["Kevin Hart", "Tiffany Haddish"]),
        ]);

        Movie::create([
            'title' => "Stars Beyond",
            'genre_id' => $sciFi->id,
            'slug' => 'stars-beyond',
            'duration' => '2h 15m',
            'year' => '2025',
            'description' => "When the Earth dies, the stars are our last hope.",
            'thumbnail' => 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=300&h=400&fit=crop',
            'video_path' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'cast' => json_encode(["Chris Pratt", "Zoe Saldana"]),
        ]);
    }

}
