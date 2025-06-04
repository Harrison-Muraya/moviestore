<?php

namespace App\Http\Controllers\Portal;

use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;


class DashboardController extends Controller
{
    public function dashboard (): Response
    {
        return Inertia::render('Dashboard');
    }

    public function getCowHealth(){
        $Movies = \App\Models\Movie::with('genre')
            ->orderBy('date', 'desc')
            ->get();

        // $data['info'] = $healthRecords;
        // $data['cows'] = $cows;

         return response()->json([
            'status' => true,
            'response' => [
                'setMovies' => $Movies,

            ]
        ]);
    }
}
