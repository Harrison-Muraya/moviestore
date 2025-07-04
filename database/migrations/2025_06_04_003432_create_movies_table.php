<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('movies', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            // $table->foreignId('genre_id')->constrained()->onDelete('cascade')->nullable();
            $table->string('slug')->unique();
            $table->string('duration')->nullable();
            $table->string('year')->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('trailer_path')->nullable(); // Add trailer support
            $table->string('video_path')->nullable(); // Make nullable for series
            $table->json('cast')->nullable();
            $table->enum('type', ['movie', 'series'])->default('movie')->nullable(); // Add content type
            $table->decimal('rating', 3, 1)->nullable(); // Add rating (0.0-10.0)
            $table->string('language')->default('en')->nullable();
            $table->string('country')->nullable();
            $table->integer('total_seasons')->nullable(); // For series
            $table->integer('total_episodes')->nullable(); // For series
            $table->integer('status')->default(0);
            $table->integer('flag')->default(1);
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index('year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movies');
    }
};
