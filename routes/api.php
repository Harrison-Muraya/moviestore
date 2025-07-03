<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Front\ContentUploadController;

Route::group(['prefix'=>'v1'], function(){
     Route::group(['prefix' => 'admin'], function () {
         Route::controller(ContentUploadController::class)->group(function () {
            Route::get('/upload-movies', 'index')->name('admin.storeview');   
            Route::post('/upload-content', 'store')->name('admin.uploadContent');

            Route::get('/movies/edit', 'movieList')->name('movies.edit.list');
            Route::get('/movies/{movie}/edit', 'edit')->name('admin.edit');
            Route::put('/movies/{movie}', 'update')->name('admin.update');
            Route::delete('/delete/movies/{movie}', 'destroy')->name('movies.destroy');
        });
    });
});