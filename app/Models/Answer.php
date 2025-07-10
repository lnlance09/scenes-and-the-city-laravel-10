<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'quiz_id',
        'user_id',
        'answer',
        'lat',
        'lng',
        'hints_used',
        'correct',
        'margin_of_error'
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

    public function quiz()
    {
        return $this->hasOne(Quiz::class, 'id', 'quiz_id');
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }
}
