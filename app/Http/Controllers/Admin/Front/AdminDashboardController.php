<?php

namespace App\Http\Controllers\Admin\Front;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Route;
use App\Models\User;


class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        Inertia::setRootView('admin');

        // dd('Admin Dashboard');

        return Inertia::render('Dashboard',);
        // return Inertia::render('Admin',);
    }

    public function getUsers()
    {
        $users = User::with('roles')->get();

        $farmers = User::whereHas('roles', function ($query) {
            $query->where('name', 'farmer');
        })->get();
        // $farms = \App\Models\Farm::with('user')->get();
        
        $roles = \App\Models\Role::all();

        return response()->json([
            'status' => true,
            'response' => [
                'users' => $users,
                'roles' => $roles,
                'farmers' => $farmers,
                // 'farms' => $farms
            ]
        ]);
    }
}
