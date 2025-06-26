<?php

namespace Database\Factories;

use App\Models\Action;
use App\Models\Scene;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SceneAction>
 */
class SceneActionFactory extends Factory
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
            'action_id' => Action::inRandomOrder()->first()?->id,
        ];
    }
}
