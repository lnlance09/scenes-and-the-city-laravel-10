<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'actor_id',
        'video_id',
        'first_name',
        'last_name'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [];

    public function actor()
    {
        return $this->hasOne(Actor::class, 'id', 'actor_id');
    }

    public function pics()
    {
        return $this->hasMany(CharacterPic::class, 'character_id', 'id');
    }

    public function video()
    {
        return $this->hasOne(Video::class, 'id', 'video_id');
    }
}
