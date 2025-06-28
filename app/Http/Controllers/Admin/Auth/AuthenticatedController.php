<?php

namespace App\Http\Controllers\Admin\Auth;


use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Validator;


class AuthenticatedController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): \Inertia\Response
    {
        Inertia::setRootView('admin'); // <-- this uses admin.blade.php

        return Inertia::render('AdminAuth/Login', [
            'canResetPassword' => Route::has('admin'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse|Response
    {
         Inertia::setRootView('admin');
        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials, $request->filled('remember'))) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

       return back()
        ->withErrors(['username' => 'Invalid credentials.'])
        ->with('message', 'Login failed. Please try again.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): Response
    {
        // Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

         Inertia::setRootView('admin');

        return Inertia::render('AdminAuth/Login', [
            'canResetPassword' => Route::has('admin'),
            'status' => session('status'),
        ]);

    }
}
