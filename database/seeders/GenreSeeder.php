<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Genre::create(['name' => 'Adventure']);
        Genre::create(['name' => 'Drama']);
        Genre::create(['name' => 'Horrar']);

    }
}
