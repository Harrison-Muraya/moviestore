<?php

namespace App\Http\Controllers\Portal;

use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;


class DashboardController extends Controller
{
    public function dashboard (): Response
    {
        return Inertia::render('Dashboard');
    }
}
