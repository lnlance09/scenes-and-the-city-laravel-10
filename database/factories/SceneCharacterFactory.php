<?php

namespace Database\Factories;

use App\Models\Character;
use App\Models\Scene;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SceneCharacter>
 */
class SceneCharacterFactory extends Factory
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
            'character_id' => Character::inRandomOrder()->first()?->id,
        ];
    }
}
