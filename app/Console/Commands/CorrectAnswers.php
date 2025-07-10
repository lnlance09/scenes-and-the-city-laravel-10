<?php

namespace App\Console\Commands;

use App\Models\Answer;
use App\Models\NewYorkCity;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CorrectAnswers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:correct-answers';

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
        $nyc = new NewYorkCity();
        $today = Carbon::now()->format('Y-m-d');
        $answers = Answer::where('created_at', $today . '00:00:00')
            ->with(['quiz'])
            ->get();

        for ($i = 0; $i < count($answers); $i++) {
            $a = $answers[$i];
            $aLocation = $nyc->locationToObject('Point', $a->lng, $a->lat);
            $qLocation = $nyc->locationToObject('Point', $a->quiz->lng, $a->quiz->lat);
            $distance = $aLocation->distance($qLocation);
            $correct = $distance < 0.05 ? 1 : 0;

            $answer = Answer::find($a->id);
            $answer->correct = $correct;
            $answer->margin_of_error = $distance;
            $answer->save();
        }
    }
}
