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
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

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
                'video' => 'required_if:type,movie|nullable|file|mimetypes:video/*,video/x-matroska,video/x-msvideo,video/quicktime|max:5120000',
                // 'video' => 'required_if:type,movie|nullable|file|mimetypes:video/*|max:2048000',
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
        // Initialize paths as null
        $thumbnailPath = null;
        $trailerPath = null;
        $videoPath = null;

        // Handle thumbnail upload - check if file exists and is valid
        if ($request->hasFile('thumbnail') && $request->file('thumbnail')->isValid()) {
            $thumbnailPath = $this->uploadFile($request->file('thumbnail'), 'thumbnails');
            if (!$thumbnailPath) {
                throw new \Exception('Failed to upload thumbnail');
            }
        }
        
        // Handle trailer upload
        if ($request->hasFile('trailer') && $request->file('trailer')->isValid()) {
            $trailerPath = $this->uploadFile($request->file('trailer'), 'trailers');
        }
        
        // Handle video upload for movies
        if ($request->hasFile('video') && $request->file('video')->isValid()) {
            $videoPath = $this->uploadFile($request->file('video'), 'videos');
            if (!$videoPath && $request->type === 'movie') {
                throw new \Exception('Failed to upload video file');
            }
        }

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
            $seasonThumbnail = null;
            
            if (isset($seasonData['thumbnail']) && $seasonData['thumbnail']->isValid()) {
                $seasonThumbnail = $this->uploadFile($seasonData['thumbnail'], 'seasons');
            }

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
            $videoPath = null;
            $thumbnailPath = null;

            // Episode video is required - check if it exists and is valid
            if (isset($episodeData['video']) && $episodeData['video']->isValid()) {
                $videoPath = $this->uploadFile($episodeData['video'], 'episodes');
                if (!$videoPath) {
                    throw new \Exception('Failed to upload episode video');
                }
            } else {
                throw new \Exception('Episode video is required');
            }
            
            // Episode thumbnail is optional
            if (isset($episodeData['thumbnail']) && $episodeData['thumbnail']->isValid()) {
                $thumbnailPath = $this->uploadFile($episodeData['thumbnail'], 'episodes/thumbnails');
            }

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
        // Validate input parameters
        if (!$file || !$directory) {
            Log::error('Upload file called with invalid parameters', [
                'file' => $file ? 'present' : 'missing',
                'directory' => $directory ?: 'empty'
            ]);
            return null;
        }

        // Check if file is valid
        if (!$file->isValid()) {
            Log::error('Invalid file upload', [
                'error' => $file->getError(),
                'directory' => $directory
            ]);
            return null;
        }

        try {
            $filename = time() . '_' . Str::random(10);
            $originalExtension = $file->getClientOriginalExtension();
            
            // Validate extension
            if (!$originalExtension) {
                Log::error('File has no extension', [
                    'original_name' => $file->getClientOriginalName(),
                    'directory' => $directory
                ]);
                return null;
            }
            
            Log::info('Starting file upload', [
                'original_name' => $file->getClientOriginalName(),
                'extension' => $originalExtension,
                'directory' => $directory,
                'size' => $file->getSize()
            ]);
            
            // Check if it's a video file that needs conversion
            if (in_array(strtolower($originalExtension), ['mkv', 'avi', 'mov', 'wmv', 'flv'])) {
                return $this->convertAndUploadVideo($file, $directory, $filename);
            }
            
            // For images and other files, upload as normal
            $fullFilename = $filename . '.' . $originalExtension;
            $path = $file->storeAs($directory, $fullFilename, 'public');
            
            if (!$path) {
                Log::error('Failed to store file', [
                    'filename' => $fullFilename,
                    'directory' => $directory
                ]);
                return null;
            }
            
            Log::info('File uploaded successfully', [
                'path' => $path,
                'filename' => $fullFilename
            ]);
            
            return $path;
            
        } catch (\Exception $e) {
            Log::error('File upload exception', [
                'error' => $e->getMessage(),
                'directory' => $directory,
                'file' => $file->getClientOriginalName()
            ]);
            return null;
        }
    }

    private function convertAndUploadVideo($file, $directory, $filename)
    {
        try {
            // Validate inputs
            if (!$file || !$directory || !$filename) {
                throw new \Exception('Invalid parameters for video conversion');
            }

            // Create temporary directory if it doesn't exist
            $tempDir = storage_path('app/temp');
            if (!file_exists($tempDir)) {
                if (!mkdir($tempDir, 0755, true)) {
                    throw new \Exception('Failed to create temporary directory');
                }
            }

            // Save uploaded file temporarily with original extension
            $originalExtension = $file->getClientOriginalExtension();
            if (!$originalExtension) {
                throw new \Exception('File has no extension');
            }

            $tempInputPath = $tempDir . '/' . $filename . '.' . $originalExtension;
            
            // Move file to temporary location
            if (!$file->move($tempDir, $filename . '.' . $originalExtension)) {
                throw new \Exception('Failed to move file to temporary location');
            }

            if (!file_exists($tempInputPath)) {
                throw new \Exception('Temporary input file does not exist');
            }

            // Define output paths
            $outputFilename = $filename . '.mp4';
            $tempOutputPath = $tempDir . '/' . $outputFilename;
            
            // Create the public storage directory path
            $publicStorageDir = storage_path('app/public/' . $directory);
            if (!file_exists($publicStorageDir)) {
                if (!mkdir($publicStorageDir, 0755, true)) {
                    throw new \Exception('Failed to create storage directory');
                }
            }

            Log::info('Starting video conversion', [
                'input' => $tempInputPath,
                'temp_output' => $tempOutputPath,
                'final_directory' => $publicStorageDir,
                'original_extension' => $originalExtension
            ]);

            // FFmpeg command for web-optimized conversion
            $ffmpegCommand = [
                'ffmpeg',
                '-i', $tempInputPath,
                '-c:v', 'libx264',           // H.264 video codec
                '-c:a', 'aac',               // AAC audio codec
                '-preset', 'medium',         // Encoding speed/quality balance
                '-crf', '23',                // Quality (18-28 range, 23 is good)
                '-movflags', '+faststart',   // Optimize for web streaming
                '-pix_fmt', 'yuv420p',       // Pixel format for compatibility
                '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease', // Scale down large videos
                '-r', '30',                  // Frame rate
                '-b:a', '128k',              // Audio bitrate
                '-ar', '44100',              // Audio sample rate
                '-y',                        // Overwrite output file
                $tempOutputPath              // Output to temp directory first
            ];

            // Execute FFmpeg conversion
            $process = new Process($ffmpegCommand);
            $process->setTimeout(43200); // 7 hour timeout
            $process->run();

            if (!$process->isSuccessful()) {
                Log::error('FFmpeg process failed', [
                    'exit_code' => $process->getExitCode(),
                    'error_output' => $process->getErrorOutput(),
                    'output' => $process->getOutput()
                ]);
                throw new \Exception('Video conversion failed: ' . $process->getErrorOutput());
            }

            // Check if conversion was successful
            if (!file_exists($tempOutputPath)) {
                throw new \Exception('Converted file was not created');
            }

            // Move the converted file to final location
            $finalPath = $publicStorageDir . '/' . $outputFilename;
            if (!rename($tempOutputPath, $finalPath)) {
                throw new \Exception('Failed to move converted file to final location');
            }

            // Clean up temporary input file
            if (file_exists($tempInputPath)) {
                unlink($tempInputPath);
            }

            // Return the relative path for database storage
            $relativePath = $directory . '/' . $outputFilename;

            Log::info('Video conversion completed successfully', [
                'final_path' => $finalPath,
                'relative_path' => $relativePath,
                'file_size' => filesize($finalPath)
            ]);

            return $relativePath;

        } catch (\Exception $e) {
            Log::error('Video conversion failed', [
                'error' => $e->getMessage(),
                'file' => $file ? $file->getClientOriginalName() : 'null',
                'directory' => $directory ?? 'null',
                'filename' => $filename ?? 'null'
            ]);

            // Clean up temporary files
            if (isset($tempInputPath) && file_exists($tempInputPath)) {
                unlink($tempInputPath);
            }
            if (isset($tempOutputPath) && file_exists($tempOutputPath)) {
                unlink($tempOutputPath);
            }

            // Fallback: upload original file without conversion
            try {
                Log::info('Falling back to original file upload');
                $originalFilename = $filename . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs($directory, $originalFilename, 'public');
                
                if (!$path) {
                    throw new \Exception('Fallback upload also failed');
                }
                
                return $path;
            } catch (\Exception $fallbackError) {
                Log::error('Fallback upload failed', [
                    'error' => $fallbackError->getMessage()
                ]);
                return null;
            }
        }
    }

    // Method to check video codec compatibility
    private function checkVideoCodec($filePath)
    {
        try {
            $command = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                $filePath
            ];

            $process = new Process($command);
            $process->run();

            if ($process->isSuccessful()) {
                $output = json_decode($process->getOutput(), true);
                
                $videoCodec = null;
                $audioCodec = null;
                
                foreach ($output['streams'] as $stream) {
                    if ($stream['codec_type'] === 'video') {
                        $videoCodec = $stream['codec_name'];
                    } elseif ($stream['codec_type'] === 'audio') {
                        $audioCodec = $stream['codec_name'];
                    }
                }

                Log::info('Video codec analysis', [
                    'video_codec' => $videoCodec,
                    'audio_codec' => $audioCodec,
                    'file' => basename($filePath)
                ]);

                return [
                    'video_codec' => $videoCodec,
                    'audio_codec' => $audioCodec,
                    'needs_conversion' => !($videoCodec === 'h264' && in_array($audioCodec, ['aac', 'mp3']))
                ];
            }
        } catch (\Exception $e) {
            Log::error('Codec analysis failed', ['error' => $e->getMessage()]);
        }

        return ['needs_conversion' => true]; // Default to conversion if analysis fails
    }

    // Background job method for large file conversion
    public function queueVideoConversion($movieId, $filePath, $fileType)
    {
        // This would typically dispatch a queued job
        // dispatch(new ConvertVideoJob($movieId, $filePath, $fileType));
        
        Log::info('Video conversion queued', [
            'movie_id' => $movieId,
            'file_path' => $filePath,
            'type' => $fileType
        ]);
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

    // Movie list edit page
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


    // update movie
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

            return redirect()->intended(route('movies.edit.list', absolute: false));

            // return response()->json([
            //     'success' => true,
            //     'message' => ucfirst($request->type ?? $movie->type) . ' updated successfully!',
            //     'data' => $movie->fresh()->load(['genres', 'seasons.episodes'])
            // ]);

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


    public function destroy(Movie $movie)
    {
        try {
            DB::beginTransaction();

            Log::info('Deleting movie/series:', [
                'id' => $movie->id,
                'title' => $movie->title,
                'type' => $movie->type
            ]);

            // Delete all associated files and records
            $this->deleteMovieCompletely($movie);

            DB::commit();


            return redirect()->intended(route('movies.edit.list', absolute: false));
            // return response()->json([
            //     'success' => true,
            //     'message' => ucfirst($movie->type) . ' "' . $movie->title . '" deleted successfully!'
            // ]);

        } catch (\Exception $e) {
            Log::error('Delete error:', [
                'movie_id' => $movie->id,
                'error' => $e->getMessage()
            ]);
            
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Error deleting content: ' . $e->getMessage()
            ], 500);
        }
    }

    private function deleteMovieCompletely(Movie $movie)
    {
        // Delete all seasons and episodes if it's a series
        if ($movie->type === 'series') {
            $movie->seasons()->each(function ($season) {
                $this->deleteSeason($season->id);
            });
        }

        // Delete movie files
        if ($movie->thumbnail) {
            Storage::disk('public')->delete($movie->thumbnail);
        }
        
        if ($movie->trailer_path) {
            Storage::disk('public')->delete($movie->trailer_path);
        }
        
        if ($movie->video_path) {
            Storage::disk('public')->delete($movie->video_path);
        }

        // Remove genre relationships
        $movie->genres()->detach();

        // Delete the movie record
        $movie->delete();

        Log::info('Movie deleted successfully:', ['id' => $movie->id]);
    }


}