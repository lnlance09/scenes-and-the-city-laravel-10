<?php

namespace App\Models;

use App\Models\NewYorkCity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    use HasFactory;

    const DEFAULT_PARAMS = [
        'correct' => null,
        'geoData' => [
            'lat' => 40.758896,
            'lng' => -73.98513,
            'hood' => 'Theater District',
            'borough' => 'Manhattan',
            'streets' => ['Broadway', '7th Ave', 'W 46th St']
        ],
        'marginOfError' => null,
        'hintsUsed' => 0,
        'hasAnswered' => false
    ];

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

    public static function setAnswerData($answer, array $data)
    {
        $nyc = new NewYorkCity();
        $lng = $answer->lng;
        $lat = $answer->lat;
        if ($lng != 0 && $lat != 0) {
            $geoData = $nyc->getLocationDetails($lng, $lat);
            $geoData['lng'] = $lng;
            $geoData['lat'] = $lat;
            $data['geoData'] = $geoData;
        }
        $data['correct'] = $answer->correct;
        $data['hintsUsed'] = $answer->hints_used;
        $data['marginOfError'] = $answer->margin_of_error;
        $data['hasAnswered'] = true;
        return $data;
    }
}
