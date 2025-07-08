<?php

namespace Database\Seeders;

use App\Models\Answer;
use App\Models\NewYorkCity;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AnswerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $nyc = new NewYorkCity();
        $quizzes = Quiz::all();
        $users = User::all();

        // Each quiz will have five answers
        for ($x = 0; $x < 5; $x++) {
            for ($i = 0; $i < count($quizzes); $i++) {
                $quiz = $quizzes[$i];
                $user = $users->random();

                if (mt_rand(2, 3) % 2 === 0) {
                    // Create values that aren't correct
                    $newDistance = mt_rand(0.05, 0.25);
                    $newPosition = $nyc->getLocationByDistance($newDistance, $newDistance, $quiz->lat, $quiz->lng);
                    $newLat = $newPosition[0];
                    $newLng = $newPosition[1];
                } else {
                    // Use identical coordinates as the quiz's answer
                    $newLat = $quiz->lat;
                    $newLng = $quiz->lng;
                }

                Answer::factory()->create([
                    'quiz_id' => $quiz->id,
                    'user_id' => $user->id,
                    'lat' => $newLat,
                    'lng' => $newLng,
                    'hints_used' => mt_rand(0, 2)
                ]);
            }
        }
    }
}
