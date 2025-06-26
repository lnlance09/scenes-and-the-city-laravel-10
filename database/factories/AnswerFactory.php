<?php

namespace Database\Factories;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Answer>
 */
class AnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_id' => Quiz::inRandomOrder()->first()?->id,
            'user_id' => User::inRandomOrder()->first()?->id,
            'answer' => fake()->sentence(1),
            'lat' => fake()->latitude(40.73, 40.80),
            'lng' => fake()->longitude(-73.93, -73.88)
        ];
    }
}
