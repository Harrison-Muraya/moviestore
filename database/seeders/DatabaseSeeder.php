<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Genre;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\GenreSeeder;
use Database\Seeders\MovieSeeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
     /**
     * Seed the application's database.
     */
    public function run(): void
    {         

        // User::factory(10)->create();
        $admin = User::with(['roles'])->create([
            'username' => 'admin',
            'name' => 'Harrison',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin')
        ]);

         User::with(['roles'])->create([
            'username' => 'harrison muraya',
            'name' => 'harrison',
            'email' => 'harrison@gmail.com',
            'password' => Hash::make('gZAxMDsmhb5EBfq')
        ]);


        $geners = GenreSeeder::class;
        $this->call($geners);

        // $movies = MovieSeeder::class;
        // $this->call($movies);

        // Add RolesTableSeeder
        $roles = RolesTableSeeder::class;
        $this->call($roles);

        // ? Assign roles with ID 1 to the user
        $admin->roles()->attach(1);

    }
}
