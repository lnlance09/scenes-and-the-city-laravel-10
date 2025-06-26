<?php

namespace Database\Seeders;

use App\Models\SceneAction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SceneActionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SceneAction::factory()
            ->count(10)
            ->create();
    }
}
