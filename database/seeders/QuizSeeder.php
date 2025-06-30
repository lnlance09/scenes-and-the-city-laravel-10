<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\Scene;
use App\Models\SceneAction;
use App\Models\ScenePic;
use App\Models\SceneCharacter;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $files = scandir(__DIR__ . '/pics/');
        array_shift($files);
        array_shift($files);

        $scenes = Scene::factory()->count(10)->create();
        $i = 0;
        foreach ($scenes as $scene) {
            $quizId = Str::random(8);
            $file = __DIR__ . '/pics/' . $files[mt_rand(0, count($files) - 1)];
            $this->createQuiz($quizId, $scene->id, $file);

            $day = $this->getDateFromDay(2025, date('z') - $i)->format('Y-m-d H:i:s');
            $quizId = Str::random(8);
            $this->createQuiz($quizId, $scene->id, $file, 1, $day);

            $i++;
        }
    }

    private function getDateFromDay(int $year, int $dayOfYear): \DateTime
    {
        $date = \DateTime::createFromFormat('Y z', strval($year) . ' ' . strval($dayOfYear - 1));
        return $date;
    }

    private function createQuiz($quizId, $sceneId, $file, $userId = null, $createdAt = null)
    {
        $img = 'quizzes/' . $quizId . '.jpg';
        Storage::disk('s3')->put($img, file_get_contents($file));

        $data['scene_id'] = $sceneId;
        if ($createdAt) {
            $data['created_at'] = $createdAt;
        }

        $picData = $data;
        $picData['s3_url'] = $img;
        if ($userId) {
            $picData['user_id'] = $userId;
        }
        $pic = ScenePic::factory()->create($picData);

        SceneAction::factory()->create($data);
        SceneCharacter::factory()->create($data);

        if ($userId) {
            $data['user_id'] = $userId;
        }
        Quiz::factory()->create($data);
    }
}
