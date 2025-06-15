<?php

namespace App\Http\Controllers\Portal;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;


class DashboardController extends Controller
{
    public function dashboard (): Response
    {
        return Inertia::render('Dashboard');
    }


    public function getMovies()
    {
        try {
            $Movies = \App\Models\Movie::with('genres')->get();
            $trendingMovies = \App\Models\Movie::with('genres')->where('type', 'movie')->latest()->take(5)->get();

            return response()->json([
                'status' => true,
                'response' => [
                    'setMovies' => $Movies,
                    'trendingMovies' => $trendingMovies,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Movie fetch failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch movies.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

}
