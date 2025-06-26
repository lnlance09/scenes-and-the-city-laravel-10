<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\Scene;
use App\Models\SceneAction;
use App\Models\ScenePic;
use App\Models\SceneCharacter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $scenes = Scene::factory()->count(10)->create();
        foreach ($scenes as $scene) {
            $pic = ScenePic::factory()->create([
                'scene_id' => $scene->id,
            ]);
            SceneAction::factory()->create([
                'scene_id' => $scene->id,
            ]);
            SceneCharacter::factory()->create([
                'scene_id' => $scene->id,
            ]);
            Quiz::factory()->create([
                'scene_id' => $scene->id,
                'user_id' => $pic->user_id
            ]);
        }
    }
}
