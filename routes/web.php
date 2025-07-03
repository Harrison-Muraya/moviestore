<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use App\Http\Middleware\CheckRolePermission;
use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\Portal\NewDashboardController;
use App\Http\Controllers\Portal\LatestDashboardController;
use App\Http\Controllers\Admin\Front\ContentUploadController;
use App\Http\Controllers\Admin\Front\AdminDashboardController;
use App\Http\Controllers\Admin\Front\AdminDashboardControllerl;

Route::get('/', [WelcomeController::class, 'welcome']);

// Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');

Route::middleware([CheckRolePermission::class . ':permissions'])->group(function () {
    Route::group(['prefix' => 'admin'], function () {

        Route::controller(AdminDashboardControllerl::class)->group(function () {
            Route::get('/dashboard', 'dashboard')->name('admin.dashboard');
            Route::get('/get-movies', 'getMovies')->name('getmoviedata');
            Route::get('/newvideo-player/{id}', 'findMovie')->name('admin.newvideo.player');
            // Route::get('/movie-list', 'movieList')->name('admin.movieList');
        });

        Route::controller(ContentUploadController::class)->group(function () {
            Route::get('/upload-movies', 'index')->name('admin.storeview');   
            // Route::post('/upload-content', 'store')->name('admin.uploadContent');

            Route::get('/movies/edit', 'movieList')->name('movies.edit.list');
            Route::get('/movies/{movie}/edit', 'edit')->name('admin.edit');
            Route::put('/movies/{movie}', 'update')->name('admin.update');
            Route::delete('/delete/movies/{movie}', 'destroy')->name('movies.destroy');
        });
    });
});
// Route::controller(LatestDashboardController::class)->group(function () {
//     Route::get('/latestdashboard', 'dashboard')->name('latestdashboard');
//     Route::get('/newvideo-player/{id}', 'findMovie')->name('newvideo.player');
// });
// Route::get('/latestdashboard', [LatestDashboardController::class, 'dashboard'])->name('latestdashboard');

// routes/api.php or routes/web.php
Route::get('/api/genres', function () {
    return response()->json(\App\Models\Genre::all());
});
                 
// Route::controller(NewDashboardController::class)->group(function () {
//     Route::get('/newlayout',  'dashboard')->name('newdashboard.layout');
//     Route::get('/video-player/{id}', 'VideoPlayer')->name('video.player');
   
// }); 


Route::controller(DashboardController::class)->group(function () {
    // Added users API endpoint
    Route::get('/get-users', 'getUsers')->name('getUsers');
   
});

Route::middleware(['auth', 'check.permission:user'])->group(function () {
    // Route::controller(ContentUploadController::class)->group(function(){
    //     // Route::get('/upload-movies', 'index')->name('storeview');   
    //     // Route::post('/upload-content', 'store')->name('uploadContent');

    //     // Route::get('/movie-list', 'movieList')->name('movieList');

    //     Route::post('/update-movie/{id}', 'update')->name('updateMovie');
    //     Route::get('/movie-details/{id}', 'show')->name('movieDetails');    
    //     Route::get('/delete-movie/{id}', 'destroy')->name('deleteMovie');
    // });

    Route::controller(LatestDashboardController::class)->group(function () {
        Route::get('/latestdashboard', 'dashboard')->name('latestdashboard');
        Route::get('/newvideo-player/{id}', 'findMovie')->name('newvideo.player');
        Route::get('/movie-list', 'movieList')->name('movieList');
    });

    // Route::controller(NewDashboardController::class)->group(function () {
    //     Route::get('/newlayout',  'dashboard')->name('dashboard');
    //     Route::get('/video-player/{id}', 'VideoPlayer')->name('video.player');    
    // }); 

    // Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

    // In routes/web.php
    // Route::get('/storage/{filename}', function ($filename) {
    //     $path = storage_path('app/public/' . $filename);
        
    //     if (!File::exists($path)) {
    //         abort(404);
    //     }
        
    //     $file = File::get($path);
    //     $type = File::mimeType($path);
        
    //     $response = Response::make($file, 200);
    //     $response->header("Content-Type", $type);
        
    //     return $response;
    // });

require __DIR__.'/auth.php';
