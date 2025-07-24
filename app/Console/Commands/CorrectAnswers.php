<?php

namespace App\Console\Commands;

use App\Models\Answer;
use Brick\Geo\Engine\GeosEngine;
use Brick\Geo\Point;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CorrectAnswers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'correct:answers';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $geos = new GeosEngine();
        $today = Carbon::now()->format('Y-m-d');
        $answers = Answer::whereBetween('created_at', [
            $today . ' 00:00:00',
            $today . ' 23:59:59'
        ])
            ->where(function ($query) {
                $query->whereNotNull('lng')->whereNotNull('lat');
            })
            ->with(['quiz'])
            ->get();

        for ($i = 0; $i < count($answers); $i++) {
            $a = $answers[$i];
            $aLocation = Point::xy($a->lng, $a->lat);
            $qLocation = Point::xy($a->quiz->lng, $a->quiz->lat);
            $distance = $geos->distance($aLocation, $qLocation);
            $correct = $distance < 0.05 ? 1 : 0;

            $answer = Answer::find($a->id);
            $answer->correct = $correct;
            $answer->margin_of_error = $distance;
            $answer->save();
        }
    }
}
