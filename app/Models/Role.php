<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
      // ? Fillable
    protected $fillable = [
        'name',
        'module',
        'description',
    ];

     /**
     * The users that belong to the role.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

}
