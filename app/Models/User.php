<?php

namespace App\Models;

use App\Models\Quiz;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    const PROTECTED_USERNAMES = [
        'about',
        'all',
        'changePassword',
        'checkUsername',
        'contact',
        'create',
        'follow',
        'forgot',
        'login',
        'profilePic',
        'rules',
        'settings',
        'sitemap',
        'terms',
        'unfollow',
        'update',
        'verify',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'points',
        'api_token',
        'forgot_code',
        'email_verified_at',
        'remember_token',
        'verification_code',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'api_token',
        'forgot_code',
        'remember_token',
        'verification_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        // 'email_verified_at' => 'datetime',
        // 'password' => 'hashed',
    ];

    public function getPoints()
    {
        $points1 = Answer::where(
            [
                'user_id' => $this->id,
                'correct' => 1,
                'hints_used' => 0
            ]
        )->count();
        $points2 = Answer::where(
            [
                'user_id' => $this->id,
                'correct' => 1,
                'hints_used' => 1
            ]
        )->count();
        $points3 = Answer::where(
            [
                'user_id' => $this->id,
                'correct' => 1,
                'hints_used' => 2
            ]
        )->count();
        $points = ($points1 * 10) + ($points2 * 8) + ($points3 * 6);
        $this->points = $points;
    }

    public function setting()
    {
        return $this->hasOne(Setting::class, 'user_id', 'id');
    }
}
