<?php

namespace App\Http\Controllers\Portal;

use Inertia\Inertia;
use App\Models\Genre;
use App\Models\Movie;
use Inertia\Response;
use App\Models\Season;
use App\Models\Episode;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ContentUploadController extends Controller
{
    public function index(): Response
    {
        $genres = Genre::active()->get();

        return Inertia::render('Uploadvideos', [
            'genres' => $genres
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Form data: endpoint was hit');

        try {
            $request->validate([
                // Basic content information
                // 'title' => 'required|string|max:255',
                'title' => 'string|max:255',
                'type' => 'required|in:movie,series',
                'genres' => 'required|array|min:1',
                'genres.*' => 'exists:genres,id',
                'description' => 'nullable|string|max:2000',
                'year' => 'nullable|numeric|min:1900|max:' . (date('Y') + 5),
                'language' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:100',
                'rating' => 'nullable|numeric|min:0|max:10',
                
                // Cast members
                'cast' => 'nullable|array',
                'cast.*' => 'string|max:255',
                
                // Required files
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400', // 5MB - Required for both
                'trailer' => 'nullable|file|mimes:mp4,avi,mov,wmv,webm|max:102400', // 100MB
                
                // Movie specific fields
                'duration' => 'required_if:type,movie|nullable|string|max:20',
                'video' => 'required_if:type,movie|nullable|file|mimes:mp4,avi,mov,wmv,webm|max:2048000', // 2GB
                
                // Series specific fields
                'seasons' => 'required_if:type,series|nullable|array|min:1',
                'seasons.*.season_number' => 'required|integer|min:1',
                'seasons.*.title' => 'nullable|string|max:255',
                'seasons.*.description' => 'nullable|string|max:1000',
                'seasons.*.thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                
                // Episodes validation
                'seasons.*.episodes' => 'required|array|min:1',
                'seasons.*.episodes.*.episode_number' => 'required|integer|min:1',
                'seasons.*.episodes.*.title' => 'required|string|max:255',
                'seasons.*.episodes.*.description' => 'nullable|string|max:1000',
                'seasons.*.episodes.*.duration' => 'nullable|string|max:20',
                'seasons.*.episodes.*.video' => 'required|file|mimes:mp4,avi,mov,wmv,webm|max:2048000',
                'seasons.*.episodes.*.thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            ]);     
            Log::info(['Form data season: ', $request->seasons]);

        } catch (ValidationException $e) {
            Log::error('Validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);

            // Optionally rethrow or return error response
            throw $e;
        }



        try {
            DB::beginTransaction();

            // Create movie/series
            $movie = $this->createMovie($request);

            // Handle genres relationship
            $movie->genres()->sync($request->genres);

            if ($request->type === 'series') {
                $this->processSeries($movie, $request->seasons);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->type) . ' uploaded successfully!',
                'data' => $movie->load(['genres', 'seasons.episodes'])
            ]);

        } catch (\Exception $e) {
            Log::info('Error:', [$e->getMessage()]);
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error uploading content: ' . $e->getMessage()
            ], 500);
        }
    }

    private function createMovie(Request $request)
    {
        // Thumbnail is now required, so we don't need to check for null
        $thumbnailPath = $this->uploadFile($request->file('thumbnail'), 'thumbnails');
        
        $trailerPath = $request->hasFile('trailer') 
            ? $this->uploadFile($request->file('trailer'), 'trailers') 
            : null;
            
        $videoPath = $request->hasFile('video') 
            ? $this->uploadFile($request->file('video'), 'videos') 
            : null;

        return Movie::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title . '-' . $request->year),
            'type' => $request->type,
            'description' => $request->description,
            'year' => $request->year,
            'language' => $request->language ?? 'en',
            'country' => $request->country,
            'cast' => $request->cast,
            'rating' => $request->rating,
            'duration' => $request->duration,
            'thumbnail' => $thumbnailPath,
            'trailer_path' => $trailerPath,
            'video_path' => $videoPath,
            'total_seasons' => $request->type === 'series' ? count($request->seasons ?? []) : null,
            'total_episodes' => $request->type === 'series' 
                ? collect($request->seasons)->sum(fn($season) => count($season['episodes'])) 
                : null,
            'status' => 1
        ]);
    }

    private function processSeries($movie, $seasonsData)
    {
        foreach ($seasonsData as $seasonData) {
            $seasonThumbnail = isset($seasonData['thumbnail']) 
                ? $this->uploadFile($seasonData['thumbnail'], 'seasons') 
                : null;

            $season = Season::create([
                'movie_id' => $movie->id,
                'season_number' => $seasonData['season_number'],
                'title' => $seasonData['title'] ?? null,
                'description' => $seasonData['description'] ?? null,
                'thumbnail' => $seasonThumbnail,
                'total_episodes' => count($seasonData['episodes']),
                'status' => 1
            ]);

            $this->processEpisodes($season, $movie, $seasonData['episodes']);
        }
    }

    private function processEpisodes($season, $movie, $episodesData)
    {
        foreach ($episodesData as $episodeData) {
            // Episode video is required by validation, so no need to check for null
            $videoPath = $this->uploadFile($episodeData['video'], 'episodes');
            
            $thumbnailPath = isset($episodeData['thumbnail']) 
                ? $this->uploadFile($episodeData['thumbnail'], 'episodes/thumbnails') 
                : null;

            Episode::create([
                'season_id' => $season->id,
                'movie_id' => $movie->id,
                'episode_number' => $episodeData['episode_number'],
                'title' => $episodeData['title'],
                'slug' => Str::slug($movie->title . '-s' . $season->season_number . '-e' . $episodeData['episode_number']),
                'description' => $episodeData['description'] ?? null,
                'duration' => $episodeData['duration'] ?? null,
                'video_path' => $videoPath,
                'thumbnail' => $thumbnailPath,
                'status' => 1
            ]);
        }
    }

    private function uploadFile($file, $directory)
    {
        // Add null check for safety
        if (!$file) {
            return null;
        }
        
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
        return $file->storeAs($directory, $filename, 'public');
    }

    // API endpoints for React
    public function getGenres()
    {
        return response()->json(Genre::active()->orderBy('sort_order')->get());
    }

    public function getContent(Request $request)
    {
        $query = Movie::with(['genres', 'seasons.episodes']);

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->genre) {
            $query->whereHas('genres', function($q) use ($request) {
                $q->where('genres.id', $request->genre);
            });
        }

        return response()->json($query->paginate(12));
    }
}