<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'scene_id',
        'user_id',
        'quiz_id',
        'hint_one',
        'hint_two',
        'lat',
        'lng'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function generateQuestion()
    {
        $scene = $this->scene;
        $video = $scene->video;
        $action = $scene->action;
        $character = $scene->characters[0]->character;
        $charName = $character->first_name . " " . $character->last_name;
        $year = $video->year;
        $actionName = $action->action->name;
        $text = "It's " . $year . " and " . $charName . " is seen here " . $actionName;
        return $text;
    }
    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [];

    public function scene()
    {
        return $this->hasOne(Scene::class, 'id', 'scene_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
