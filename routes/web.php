<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\Portal\ContentUploadController;

Route::get('/', [WelcomeController::class, 'welcome']);

// Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');

Route::controller(DashboardController::class)->group(function () {
    Route::get('/admin/dashboard', 'index')->name('admin.dashboard');

    // Added CowHealth API endpoint
    Route::get('/get-movies', 'getMovies')->name('getmoviedata');
});

Route::controller(ContentUploadController::class)->group(function(){
    Route::get('/upload-movies', 'index')->name('storeview');   
    Route::post('/upload-content', 'store')->name('uploadContent');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
