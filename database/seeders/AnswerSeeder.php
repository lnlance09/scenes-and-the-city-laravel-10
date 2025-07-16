<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\NewYorkCity;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quizzes = Quiz::all();
        $users = User::all();

        // Each quiz will have five answers
        for ($x = 0; $x < 5; $x++) {
            for ($i = 0; $i < count($quizzes); $i++) {
                $quiz = $quizzes[$i];
                $user = $users->random();
                $status = 1;

                if (mt_rand(2, 3) % 2 === 0) {
                    // Create values that aren't correct
                    $nyc = new NewYorkCity();
                    $newLat = (float)$quiz->lat + mt_rand(1, 8) / 100;
                    $newLng = (float)$quiz->lng + mt_rand(1, 8) / 100;
                    $status = 0;
                    $loc1 = $nyc->locationToObject('Point', $quiz->lng, $quiz->lat);
                    $loc2 = $nyc->locationToObject('Point', $newLng, $newLat);
                    $distance = $loc1->distance($loc2);
                } else {
                    // Use identical coordinates as the quiz's answer
                    $newLat = $quiz->lat;
                    $newLng = $quiz->lng;
                    $distance = 0;
                }

                Answer::factory()->create([
                    'quiz_id' => $quiz->id,
                    'user_id' => $user->id,
                    'lat' => $newLat,
                    'lng' => $newLng,
                    'correct' => $status,
                    'margin_of_error' => $distance,
                    'hints_used' => mt_rand(0, 2),
                    'created_at' => $quiz->created_at
                ]);
            }
        }
    }
}
