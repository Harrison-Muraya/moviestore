<?php

namespace App\Http\Controllers\Admin\Front;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Http\Request;

class FarmController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
public function store(Request $request)
{
    $validated = $request->validate([
        'user_id' => 'required|exists:users,id',
        'name' => 'required|string|max:255',
        'location' => 'required|string|max:255',
        'size' => 'nullable|string|max:255',
        'contact_number' => 'nullable|string|max:20',
        'type' => 'required|string',
        'established_at' => 'nullable|date',
        'employee_count' => 'nullable|integer',
    ]);

    $targetUser = User::find($validated['user_id']);

    if ($targetUser->farm) {
        return redirect()->back()->withErrors(['That user already has a farm registered.']);
    }

    // Farm::create($validated);

    return redirect()->back()->with('success', 'Farm registered successfully.');
}


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // $farm = Farm::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'size' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'type' => 'required|string',
            'established_at' => 'nullable|date',
            'employee_count' => 'nullable|integer',
        ]);

        // $farm->update($validated);

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // $farm = Farm::findOrFail($id);

        // $farm->delete();
    }
}
