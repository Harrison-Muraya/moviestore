<?php

namespace App\Http\Controllers\Portal;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;


class LatestDashboardController extends Controller
{
    public function dashboard (): Response
    {
        // $genre = \App\Models\Genre::with('movies')->get();

        $genre = \App\Models\Genre::with(['movies' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])->get();

        if ($genre->isEmpty()) {
            // Log::warning('No genre found in the database.');
            return Inertia::render('Error', [
                'message' => 'No genre available.',
            ]);      
            
        }
        // dd($genre);
        return Inertia::render('Latestdashboard',
            [
                'genre' => $genre,
            ]
        );
    }

    /**
     * Fetch movies with genres.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function findMovie($id): Response
    {

        $movie = \App\Models\Movie::with('genres')->find($id);
        $playlist = \App\Models\Movie::where('id', '!=', $id)->limit(10)->get();

        if (!$movie) {
            Log::error('Movie not found', ['id' => $id]);
            return Inertia::render('Error', [
                'message' => 'Movie not found.',
            ]);
        }

         return Inertia::render('Player',
            [
                'movie' => $movie,
                'playlist' => $playlist,
            ]
        );
    }

     public function movieList(): Response
    {
        $movies = \App\Models\Movie::orderBy('created_at', 'desc')->get();

        return Inertia::render('MovieList', [
            'movies' => $movies,
        ]);
    }


    public function getMovies()
    {
        try {
            $Movies = \App\Models\Movie::with('genres')->get();

            return response()->json([
                'status' => true,
                'response' => [
                    'setMovies' => $Movies,
                ]
            ]);
        } catch (\Exception $e) {
            // Log::error('Movie fetch failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch movies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function VideoPlayer ($id): Response
    {
        // Log::info('VideoPlayer method called ',[ $id]);

        $movie = \App\Models\Movie::with('genres')->find($id);
        if (!$movie) {
            Log::error('Movie not found', ['id' => $id]);
            return Inertia::render('Error', [
                'message' => 'Movie not found.',
            ]);
        }
        return Inertia::render('Player',
            [
                'movie' => $movie,
            ]
        );
    }

}
