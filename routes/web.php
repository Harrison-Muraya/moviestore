<?php

use App\Http\Controllers\Portal\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [WelcomeController::class, 'welcome']);

// Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');

Route::controller(DashboardController::class)->group(function () {
    Route::get('/admin/dashboard', 'index')->name('admin.dashboard');

    // Added CowHealth API endpoint
    Route::get('/get-cowdata', 'getCowHealth')->name('getmoviedata');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard',[DashboardController::class, 'dashboard'] )->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
