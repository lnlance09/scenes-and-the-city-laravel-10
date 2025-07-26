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
        'is_official',
        'hint_one',
        'hint_two',
        'lat',
        'lng',
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

    static function isValidId(string $str)
    {
        return strlen($str) === 8 && ctype_alnum($str);
    }

    static function isValidDate($date, $format)
    {
        $d = \DateTime::createFromFormat($format, $date);
        return $d && strtolower($d->format($format)) === strtolower($date);
    }

    public function generateQuestion()
    {
        $scene = $this->scene;
        $characters = $scene->characters;
        $character = $characters[0]->character;
        $year = $scene->video->year;
        $action = $scene->action->action->name;
        $charName = $this->formatName($character);
        $text = "It's " . $year . " and " . $charName . " is seen here " . $action . ".";
        return $text;
        /*
        $partTwo = $this->partTwo;
        if (!$partTwo) {
            return $text;
        }

        $charName2 = $this->formatName($partTwo->scene->characters[0]->character);
        $partTwoYear = $partTwo->scene->video->year;
        $timing = $partTwoYear > $year ? "later" : "earlier";
        $phrase = $partTwoYear > $year ? "would be" : "was";
        $yearsDiff = $partTwoYear > $year ? $partTwoYear - $year : $partTwoYear - $year;

        if ($this->distance) {
            $text .= $text . " - approximately " . $this->distance . "  away from";
        }
        $text .= " where " . $charName2 . " " . $phrase . " seen " . $action2;
        if ($partTwoYear === $year) {
            return $text . " during the same year.";
        }
        return $text . " " . $yearsDiff . " " . formatPlural($yearsDiff, "year") . " " . $timing;
        */
    }

    private function formatName($data)
    {
        if (is_null($data->last_name)) {
            return $data->first_name;
        }
        return trim($data->first_name . ' ' . $data->last_name);
    }



    public function scene()
    {
        return $this->hasOne(Scene::class, 'id', 'scene_id');
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id');
    }

    public function partTwo()
    {
        return $this->hasOne(QuizPartTwo::class, 'quiz_id_one', 'id');
    }
}
