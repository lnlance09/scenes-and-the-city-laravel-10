<?php

namespace Database\Seeders;

use App\Models\Action;
use App\Models\Quiz;
use App\Models\Scene;
use App\Models\SceneAction;
use App\Models\ScenePic;
use App\Models\SceneCharacter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $quizzes = File::json(resource_path('json/quizzes.json'));
        for ($i = 0; $i < count($quizzes['data']); $i++) {
            $q = $quizzes['data'][$i];
            $q['file'] = __DIR__ . '/pics/' . $q['file'];
            $q['quiz_id'] = Str::random(8);
            $q['user_id'] = 1;
            $q['created_at'] = $this->getDateFromDay(2025, (date('z') + 1) - $i)->format('Y-m-d H:i:s');
            $this->createQuiz($q);
        }
    }

    private function createQuiz($data)
    {
        $scene = Scene::factory()->create([
            'video_id' => $data['videoId']
        ]);

        $img = 'quizzes/' . $data['quiz_id'] . '.jpg';
        Storage::disk('s3')->put($img, file_get_contents($data['file']));

        $picData = [];
        $picData['s3_url'] = $img;
        $picData['scene_id'] = $scene->id;
        $picData['user_id'] = $data['user_id'];
        ScenePic::factory()->create($picData);

        $action = Action::factory()->create([
            'name' => $data['action']
        ]);
        SceneAction::factory()->create([
            'action_id' => $action->id,
            'scene_id' => $scene->id
        ]);
        SceneCharacter::factory()->create([
            'character_id' => $data['charId'],
            'scene_id' => $scene->id
        ]);
        Quiz::factory()->create([
            'scene_id' => $scene->id,
            'user_id' => $data['user_id'],
            'quiz_id' => $data['quiz_id'],
            'hint_one' => $data['hint'],
            'hint_two' => '',
            'lat' => $data['lat'],
            'lng' => $data['lng'],
            'created_at' => $data['created_at']
        ]);
    }

    private function getDateFromDay(int $year, int $dayOfYear): \DateTime
    {
        return \DateTime::createFromFormat('Y z', strval($year) . ' ' . strval($dayOfYear - 1));
    }
}
