<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Scene extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'video_id',
        'name',
        'start_time',
        'end_time'
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

    public function action()
    {
        return $this->hasOne(SceneAction::class, 'scene_id', 'id');
    }

    public function characters()
    {
        return $this->hasMany(SceneCharacter::class, 'scene_id', 'id');
    }

    public function pics()
    {
        return $this->hasMany(ScenePic::class, 'scene_id', 'id');
    }

    public function video()
    {
        return $this->hasOne(Video::class, 'id', 'video_id');
    }
}
