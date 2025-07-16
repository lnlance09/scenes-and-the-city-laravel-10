<?php

namespace Database\Factories;

use App\Models\Quiz;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Scene>
 */
class SceneFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $id1 = Quiz::inRandomOrder()->first()?->id;
        return [
            'quiz_id_one' => $id1,
            'quiz_id_two' => Quiz::whereNotIn('id', [$id1])
                ->inRandomOrder()
                ->first()
                ?->id,
        ];
    }
}
