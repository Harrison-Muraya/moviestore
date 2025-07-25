<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Route;
use App\Http\Requests\Auth\LoginRequest;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    // authenticate via email
    public function authenticate(Request $request): Response | RedirectResponse
    {
        // Log::info('Authenticating user with email: ', [ $request->all()]);
        $request->validate([
            'email' => ['required', 'email'],
        ]);
        $email = $request->input('email');
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            
             return Inertia::render('Auth/Register', [ 
                'email' => $email,
                'message' => 'The provided email does not exist in our records. Please register first.',
                'alertType' => 'warning',
            ]);
          }
        Auth::login($user);
        $request->session()->regenerate();
        return redirect()->intended(route('latestdashboard', absolute: false));
    }


    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('latestdashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
