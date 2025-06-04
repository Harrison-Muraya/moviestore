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
       Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('season_id')->constrained()->onDelete('cascade');
            $table->foreignId('movie_id')->constrained()->onDelete('cascade'); // For easier queries
            $table->integer('episode_number');
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('duration')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('video_path');
            $table->decimal('rating', 3, 1)->nullable();
            $table->date('air_date')->nullable();
            $table->integer('status')->default(0);
            $table->integer('flag')->default(1);
            $table->timestamps();
            
            $table->unique(['season_id', 'episode_number']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
