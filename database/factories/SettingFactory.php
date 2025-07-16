<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ScenePic>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()?->id,
            'dark_mode' => mt_rand(0, 1),
            'hard_mode' => mt_rand(0, 1),
            'lang' => 'en',
            'measure_units_in' => mt_rand(0, 1) === 1 ? 'miles' : 'kilometers',
            'reveal_answers' => mt_rand(0, 1)
        ];
    }
}
