<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
          $get_level = [
            'customer' => 'Customer',
            'employee' => 'Employee',
            'farmer' => 'Farmer'
        ];
        return Inertia::render('Auth/Register', ['levels'=>$get_level]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'level' => "required|max:10",
        ]);

        // $user = User::create([
        //     'name' => $request->name,
        //     'email' => $request->email,
        //     'password' => Hash::make($request->password),
        // ]);

        $saved = new \App\Models\User();
        $saved->name = $request->name;
        $saved->email = $request->email;
        $saved->password = Hash::make($request->password);
        $saved->flag = 1;
        $saved->save();


        // ? Assign roles with ID 2 to the user - CUSTOMER
        $user = \App\Models\User::find($saved->id);
        $user->roles()->attach(config("userrole.{$request->level}"));

        event(new Registered($user));

        return redirect()->route('login')->with('status', 'Registration successful. Please log in.');
    }
}
