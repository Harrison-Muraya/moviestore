<?php

namespace App\Http\Controllers\Admin\Front;

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
        Inertia::setRootView('admin');
        $genres = Genre::active()->get();

        return Inertia::render('Uploadvideos', [
            'genres' => $genres
        ]);
    }

    public function movieList(): Response
    {
        Inertia::setRootView('admin');
        $movies = Movie::get();

        // dd($movies);
        return Inertia::render('MovieEditList', [
            'movies' => $movies,
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Raw request data:', [
            'all' => $request->all(),
            'input' => $request->input(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'has_files' => $request->hasFile('thumbnail'),
        ]);

        // dd($request()->all());

        try {
            $request->validate([
                // Basic content information
                // 'title' => 'required|string|max:255',
                'title' => 'string|max:255',
                'type' => 'nullable|in:movie,series',
                'genres' => 'nullable|array|min:1',
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
                'trailer' => 'nullable|file|mimetypes:video/*|max:102400',
                // 'trailer' => 'nullable|file|mimes:mp4,avi,mov,wmv,webm|max:102400', // 100MB
                
                
                // Movie specific fields
                'duration' => 'required_if:type,movie|nullable|string|max:20',
                'video' => 'required_if:type,movie|nullable|file|mimetypes:video/*|max:2048000',
                // 'video' => 'required_if:type,movie|nullable|file|mimes:mp4,avi,mov,wmv,webm|max:2048000', // 2GB
                
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
                'seasons.*.episodes.*.video' => 'required|file|mimetypes:video/*|max:2048000',
                // 'seasons.*.episodes.*.video' => 'required|file|mimes:mp4,avi,mov,wmv,webm|max:2048000',
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


    public function movieListEdit(): Response
    {
        Inertia::setRootView('admin');
        $movies = Movie::get();

        return Inertia::render('MovieEditList', [
            'movies' => $movies,
        ]);
    }

    public function edit(Movie $movie)
    {
        Inertia::setRootView('admin');
        $movie->load(['genres', 'seasons.episodes']);
        $genres = Genre::get();

        // dd($genres);
        
        return Inertia::render('EditMovie', [
            'movie' => $movie,
            'genres' => $genres
        ]);
    }



    public function update(Request $request, Movie $movie)
    {
        Log::info('Update request data:', [
            'movie_id' => $movie->id,
            'all' => $request->all(),
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'has_files' => $request->hasFile('thumbnail'),
        ]);

        try {
            $request->validate([
                // Basic content information
                'title' => 'string|max:255',
                'type' => 'nullable|in:movie,series',
                'genres' => 'nullable|array|min:1',
                'genres.*' => 'exists:genres,id',
                'description' => 'nullable|string|max:2000',
                'year' => 'nullable|numeric|min:1900|max:' . (date('Y') + 5),
                'language' => 'nullable|string|max:10',
                'country' => 'nullable|string|max:100',
                'rating' => 'nullable|numeric|min:0|max:10',
                
                // Cast members
                'cast' => 'nullable|array',
                'cast.*' => 'string|max:255',
                
                // Optional files for update
                'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
                'trailer' => 'nullable|file|mimetypes:video/*|max:102400',
                
                // Movie specific fields
                'duration' => 'required_if:type,movie|nullable|string|max:20',
                'video' => 'nullable|file|mimetypes:video/*|max:2048000',
                
                // Series specific fields
                'seasons' => 'required_if:type,series|nullable|array|min:1',
                'seasons.*.id' => 'nullable|exists:seasons,id',
                'seasons.*.season_number' => 'required|integer|min:1',
                'seasons.*.title' => 'nullable|string|max:255',
                'seasons.*.description' => 'nullable|string|max:1000',
                'seasons.*.thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'seasons.*.delete' => 'nullable|boolean',
                
                // Episodes validation
                'seasons.*.episodes' => 'required|array|min:1',
                'seasons.*.episodes.*.id' => 'nullable|exists:episodes,id',
                'seasons.*.episodes.*.episode_number' => 'required|integer|min:1',
                'seasons.*.episodes.*.title' => 'required|string|max:255',
                'seasons.*.episodes.*.description' => 'nullable|string|max:1000',
                'seasons.*.episodes.*.duration' => 'nullable|string|max:20',
                'seasons.*.episodes.*.video' => 'nullable|file|mimetypes:video/*|max:2048000',
                'seasons.*.episodes.*.thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
                'seasons.*.episodes.*.delete' => 'nullable|boolean',
            ]);

            Log::info(['Update form data season: ', $request->seasons]);

        } catch (ValidationException $e) {
            Log::error('Update validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);
            throw $e;
        }

        try {
            DB::beginTransaction();

            // Update movie/series
            $this->updateMovie($movie, $request);

            // Handle genres relationship
            if ($request->has('genres')) {
                $movie->genres()->sync($request->genres);
            }

            if ($request->type === 'series' && $request->has('seasons')) {
                $this->updateSeries($movie, $request->seasons);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => ucfirst($request->type ?? $movie->type) . ' updated successfully!',
                'data' => $movie->fresh()->load(['genres', 'seasons.episodes'])
            ]);

        } catch (\Exception $e) {
            Log::error('Update error:', [$e->getMessage()]);
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error updating content: ' . $e->getMessage()
            ], 500);
        }
    }

    private function updateMovie(Movie $movie, Request $request)
    {
        $updateData = [];

        // Update basic fields if provided
        $fields = ['title', 'type', 'description', 'year', 'language', 'country', 'rating', 'duration'];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $updateData[$field] = $request->$field;
            }
        }

        // Update cast if provided
        if ($request->has('cast')) {
            $updateData['cast'] = $request->cast;
        }

        // Update slug if title or year changed
        if ($request->has('title') || $request->has('year')) {
            $title = $request->title ?? $movie->title;
            $year = $request->year ?? $movie->year;
            $updateData['slug'] = Str::slug($title . '-' . $year);
        }

        // Handle file uploads
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($movie->thumbnail) {
                Storage::disk('public')->delete($movie->thumbnail);
            }
            $updateData['thumbnail'] = $this->uploadFile($request->file('thumbnail'), 'thumbnails');
        }

        if ($request->hasFile('trailer')) {
            // Delete old trailer
            if ($movie->trailer_path) {
                Storage::disk('public')->delete($movie->trailer_path);
            }
            $updateData['trailer_path'] = $this->uploadFile($request->file('trailer'), 'trailers');
        }

        if ($request->hasFile('video')) {
            // Delete old video
            if ($movie->video_path) {
                Storage::disk('public')->delete($movie->video_path);
            }
            $updateData['video_path'] = $this->uploadFile($request->file('video'), 'videos');
        }

        // Update totals for series
        if ($request->type === 'series' && $request->has('seasons')) {
            $updateData['total_seasons'] = count($request->seasons);
            $updateData['total_episodes'] = collect($request->seasons)->sum(fn($season) => count($season['episodes'] ?? []));
        }

        $movie->update($updateData);
    }

    private function updateSeries($movie, $seasonsData)
    {
        $existingSeasonIds = [];

        foreach ($seasonsData as $seasonData) {
            // Check if this season should be deleted
            if (isset($seasonData['delete']) && $seasonData['delete']) {
                if (isset($seasonData['id'])) {
                    $this->deleteSeason($seasonData['id']);
                }
                continue;
            }

            if (isset($seasonData['id'])) {
                // Update existing season
                $season = Season::find($seasonData['id']);
                if ($season) {
                    $this->updateSeason($season, $seasonData);
                    $existingSeasonIds[] = $season->id;
                }
            } else {
                // Create new season
                $season = $this->createSeason($movie, $seasonData);
                $existingSeasonIds[] = $season->id;
            }
        }

        // Delete seasons that are no longer in the request
        Season::where('movie_id', $movie->id)
            ->whereNotIn('id', $existingSeasonIds)
            ->each(function ($season) {
                $this->deleteSeason($season->id);
            });
    }

    private function updateSeason($season, $seasonData)
    {
        $updateData = [];

        $fields = ['season_number', 'title', 'description'];
        foreach ($fields as $field) {
            if (isset($seasonData[$field])) {
                $updateData[$field] = $seasonData[$field];
            }
        }

        // Handle season thumbnail
        if (isset($seasonData['thumbnail']) && is_file($seasonData['thumbnail'])) {
            // Delete old thumbnail
            if ($season->thumbnail) {
                Storage::disk('public')->delete($season->thumbnail);
            }
            $updateData['thumbnail'] = $this->uploadFile($seasonData['thumbnail'], 'seasons');
        }

        // Update episode count
        if (isset($seasonData['episodes'])) {
            $updateData['total_episodes'] = count($seasonData['episodes']);
        }

        $season->update($updateData);

        // Update episodes
        if (isset($seasonData['episodes'])) {
            $this->updateEpisodes($season, $season->movie, $seasonData['episodes']);
        }
    }

    private function createSeason($movie, $seasonData)
    {
        $seasonThumbnail = (isset($seasonData['thumbnail']) && is_file($seasonData['thumbnail']))
            ? $this->uploadFile($seasonData['thumbnail'], 'seasons')
            : null;

        $season = Season::create([
            'movie_id' => $movie->id,
            'season_number' => $seasonData['season_number'],
            'title' => $seasonData['title'] ?? null,
            'description' => $seasonData['description'] ?? null,
            'thumbnail' => $seasonThumbnail,
            'total_episodes' => count($seasonData['episodes'] ?? []),
            'status' => 1
        ]);

        if (isset($seasonData['episodes'])) {
            $this->processEpisodes($season, $movie, $seasonData['episodes']);
        }

        return $season;
    }

    private function updateEpisodes($season, $movie, $episodesData)
    {
        $existingEpisodeIds = [];

        foreach ($episodesData as $episodeData) {
            // Check if this episode should be deleted
            if (isset($episodeData['delete']) && $episodeData['delete']) {
                if (isset($episodeData['id'])) {
                    $this->deleteEpisode($episodeData['id']);
                }
                continue;
            }

            if (isset($episodeData['id'])) {
                // Update existing episode
                $episode = Episode::find($episodeData['id']);
                if ($episode) {
                    $this->updateEpisode($episode, $episodeData, $season, $movie);
                    $existingEpisodeIds[] = $episode->id;
                }
            } else {
                // Create new episode
                $episode = $this->createEpisode($season, $movie, $episodeData);
                $existingEpisodeIds[] = $episode->id;
            }
        }

        // Delete episodes that are no longer in the request
        Episode::where('season_id', $season->id)
            ->whereNotIn('id', $existingEpisodeIds)
            ->each(function ($episode) {
                $this->deleteEpisode($episode->id);
            });
    }

    private function updateEpisode($episode, $episodeData, $season, $movie)
    {
        $updateData = [];

        $fields = ['episode_number', 'title', 'description', 'duration'];
        foreach ($fields as $field) {
            if (isset($episodeData[$field])) {
                $updateData[$field] = $episodeData[$field];
            }
        }

        // Update slug if title or episode number changed
        if (isset($episodeData['title']) || isset($episodeData['episode_number'])) {
            $title = $episodeData['title'] ?? $episode->title;
            $episodeNumber = $episodeData['episode_number'] ?? $episode->episode_number;
            $updateData['slug'] = Str::slug($movie->title . '-s' . $season->season_number . '-e' . $episodeNumber);
        }

        // Handle video upload
        if (isset($episodeData['video']) && is_file($episodeData['video'])) {
            // Delete old video
            if ($episode->video_path) {
                Storage::disk('public')->delete($episode->video_path);
            }
            $updateData['video_path'] = $this->uploadFile($episodeData['video'], 'episodes');
        }

        // Handle thumbnail upload
        if (isset($episodeData['thumbnail']) && is_file($episodeData['thumbnail'])) {
            // Delete old thumbnail
            if ($episode->thumbnail) {
                Storage::disk('public')->delete($episode->thumbnail);
            }
            $updateData['thumbnail'] = $this->uploadFile($episodeData['thumbnail'], 'episodes/thumbnails');
        }

        $episode->update($updateData);
    }

    private function createEpisode($season, $movie, $episodeData)
    {
        $videoPath = isset($episodeData['video']) && is_file($episodeData['video'])
            ? $this->uploadFile($episodeData['video'], 'episodes')
            : null;

        $thumbnailPath = (isset($episodeData['thumbnail']) && is_file($episodeData['thumbnail']))
            ? $this->uploadFile($episodeData['thumbnail'], 'episodes/thumbnails')
            : null;

        return Episode::create([
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

    private function deleteSeason($seasonId)
    {
        $season = Season::find($seasonId);
        if (!$season) return;

        // Delete all episodes in this season
        $season->episodes()->each(function ($episode) {
            $this->deleteEpisode($episode->id);
        });

        // Delete season thumbnail
        if ($season->thumbnail) {
            Storage::disk('public')->delete($season->thumbnail);
        }

        $season->delete();
    }

    private function deleteEpisode($episodeId)
    {
        $episode = Episode::find($episodeId);
        if (!$episode) return;

        // Delete episode files
        if ($episode->video_path) {
            Storage::disk('public')->delete($episode->video_path);
        }
        if ($episode->thumbnail) {
            Storage::disk('public')->delete($episode->thumbnail);
        }

        $episode->delete();
    }
}