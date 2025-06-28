<?php

namespace Database\Seeders;


use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::create([
            "name" => 'Admin',
            "slug" => 'admin',
            "module" => 'dashboard,users,permissions,setup,control,paper,mock,research',
            "authority" => 'main',
        ]);

        Role::create([
            "name" => 'Customer',
            "slug" => 'customer',
            "module" => 'portal,customer',
            "authority" => 'customer',
        ]);

        Role::create([
            "name" => 'Employee',
            "slug" => 'employee',
            "module" => 'portal,employee',
            "authority" => 'employee',
        ]);

        Role::create([
            "name" => 'Farmer',
            "slug" => 'farmer',
            "module" => 'portal,Farmer',
            "authority" => 'farmer',
        ]);
    }
}
