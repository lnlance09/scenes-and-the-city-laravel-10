<?php

namespace Database\Factories;

use App\Models\Scene;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'scene_id' => Scene::inRandomOrder()->first()?->id,
            'user_id' => User::inRandomOrder()->first()?->id,
            'quiz_id' => Str::random(8),
            'hint_one' => fake()->sentence(1),
            'lat' => fake()->latitude(40.73, 40.80),
            'lng' => fake()->longitude(-73.93, -73.88)
        ];
    }
}
