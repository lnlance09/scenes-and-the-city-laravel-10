<?php

namespace App\Http\Controllers;

use App\Http\Resources\Quiz as QuizResource;
use App\Models\Action;
use App\Models\Answer;
use App\Models\Character;
use App\Models\Quiz;
use App\Models\Scene;
use App\Models\ScenePic;
use App\Models\SceneAction;
use App\Models\SceneCharacter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class QuizController extends Controller
{
    const OFFICIAL_USER_ID = 1;

    private $realQuizId;

    /**
     * Display the specified resource.
     *
     * @param  String  $slug
     * @return QuizResource
     */
    public function show(Request $request, String $quizId)
    {
        $quiz = Quiz::where('quiz_id', $quizId)->first();
        if (empty($quiz)) {
            return response([
                'message' => 'That quiz does not exist'
            ], 404);
        }
        return new QuizResource($quiz);
    }

    /**
     * Display the specified resource.
     *
     * @param  String  $slug
     * @return QuizResource
     */
    public function showByDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:n-j-y',
        ]);
        $date = $request->input('date');
        $quiz = Quiz::where('user_id', Self::OFFICIAL_USER_ID)
            ->whereBetween('created_at', [
                Carbon::createFromFormat('n-j-y', $date)->format('Y-m-d') . ' 00:00:00',
                Carbon::createFromFormat('n-j-y', $date)->format('Y-m-d') . ' 23:59:59'
            ])
            ->first();
        if (empty($quiz)) {
            return response([
                'message' => 'That quiz does not exist'
            ], 404);
        }
        return new QuizResource($quiz);
    }

    private function uploadToS3(Request $request, $quizId)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif',
        ]);
        $file = $request->file('file');
        $manager = new ImageManager(new Driver());
        $img = $manager->read($file);
        $img->resize(320, 320);
        $img->save($file);
        $s3Url = "quizzes/{quizId}.jpg";
        Storage::disk('s3')->put($s3Url, file_get_contents($file));
        return $s3Url;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return PredictionResource
     * @param  \Illuminate\Http\Request  $request
     */
    public function create(Request $request)
    {
        $request->validate([
            'videoId' => 'bail|required|exists:videos,id',
            'charId' => 'bail|required|exists:characters,id',
            'action' => 'bail|unique:actions,name|max:20',
            'actionId' => 'bail|exists:actions,id',
            'hintOne' => 'bail|required|min:3|max:20'
        ]);

        // $userId = $request->user()->id;
        $userId = 1;
        $videoId = $request->input('videoId');
        $charId = $request->input('charId');
        $actionId = $request->input('actionId', false);
        $action = $request->input('action', null);
        $lat = $request->input('lat', null);
        $lng = $request->input('lng', null);
        $hintOne = $request->input('hintOne');
        $quizId = Str::random(8);

        // Make sure that the character belongs to the specified video
        $char = Character::where([
            'id' => $charId,
            'video_id' => $videoId
        ])->first();
        if (!$char) {
            return response([
                'message' => 'The character is not in that movie'
            ], 400);
        }

        $s3Url = $this->uploadToS3($request, $quizId);
        $scene = Scene::create([
            'video_id' => $videoId,
        ]);
        $scene->refresh();

        if (!$actionId) {
            $newAction = Action::create([
                'name' => $action
            ]);
            $newAction->refresh();
            $actionId = $newAction->id;
        }
        SceneAction::create([
            'scene_id' => $scene->id,
            'action_id' => $actionId,
        ]);
        ScenePic::create([
            'scene_id' => $scene->id,
            'user_id' => $userId,
            's3_url' => $s3Url,
        ]);
        SceneCharacter::create([
            'scene_id' => $scene->id,
            'character_id' => $charId,
        ]);

        Quiz::create([
            'scene_id' => $scene->id,
            'user_id' => $userId,
            'quiz_id' => $quizId,
            'img' => $s3Url,
            'hint_one' => $hintOne,
            'hint_two' => '',
            'lat' => $lat,
            'lng' => $lng
        ]);
        return response([
            'quiz' => $quizId
        ], 201);
    }

    private function validateQuiz(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $quiz = Quiz::where('quizId', $quizId)->first();
        if (!$quiz) {
            return response([
                'message' => 'The quiz does not exist'
            ], 400);
        }

        if ($quiz->user_id == $userId) {
            return response([
                'message' => 'You cannot answer your own quiz'
            ], 400);
        }

        $this->realQuizId = $quiz->id;
    }

    public function answer(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $this->validateQuiz($request, $quizId);

        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $answerText = $request->input('answer');

        Answer::updateOrCreate([
            'quiz_id' => $this->realQuizId,
            'user_id' => $userId
        ], [
            'lat' => $lat,
            'lng' => $lng,
            'answer' => $answerText
        ]);

        return response([
            'message' => 'Success'
        ], 200);
    }

    public function hint(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $this->validateQuiz($request, $quizId);

        $where = [
            'quiz_id' => $this->realQuizId,
            'user_id' => $userId,
        ];
        $answer = Answer::where($where)->first();
        if (!$answer) {
            $answer = Answer::create($where);
            $answer->refresh();
        }

        $hintsUsed = $answer->hints_used;
        if ($hintsUsed > 1) {
            return response([
                'message' => 'You have already used up all your hints.'
            ], 422);
        }

        $answer->hints_used = $hintsUsed + 1;
        $answer->save();

        return response([
            'message' => 'Success'
        ], 200);
    }

    public function leaderboard(Request $request) {}

    public function getAnswer(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $where = [
            'quiz_id' => $quizId,
            'user_id' => $userId,
        ];
        $answer = Answer::where($where)->first();
        if ($answer) {
            return response([
                'message' => "You haven't submitted an answer"
            ], 404);
        }

        return response([
            'answer' => $answer
        ]);
    }
}
