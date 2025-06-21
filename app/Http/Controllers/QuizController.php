<?php

namespace App\Http\Controllers;

use App\Http\Resources\Quiz as QuizResource;
use App\Models\Action;
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
use Intervention\Image\Decoders\DataUriImageDecoder;
use Intervention\Image\Decoders\Base64ImageDecoder;

class QuizController extends Controller
{
    const OFFICIAL_USER_ID = 1;

    /**
     * Display the specified resource.
     *
     * @param  String  $slug
     * @return CoinResource
     */
    public function show(Request $request, String $quizId)
    {
        $quiz = Quiz::where('quiz_id', $quizId)
            ->with(['user', 'scene', 'scene.sceneCharacters'])
            ->first();
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
     * @return CoinResource
     */
    public function showByDate(Request $request, String $date)
    {
        $request->validate([
            'date' => 'required|date_format:M-D-YY',
        ]);
        // $ago = Carbon::now()->subDays(2)->format('Y-m-d h:i:s');

        $quiz = Quiz::where([
            'created_at' => $date,
            'user_id' => Self::OFFICIAL_USER_ID
        ])
            ->with(['user', 'scene'])
            ->first();
        if (empty($quiz)) {
            return response([
                'message' => 'That quiz does not exist'
            ], 404);
        }
        return new QuizResource($quiz);
    }

    private function uploadToS3(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif',
        ]);
        $file = $request->file('file');

        $manager = new ImageManager(new Driver());
        $img = $manager->read($file);
        $img->resize(320, 320);
        $img->save($file);

        $s3Url = 'users/' . Str::random(24) . '.jpg';
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
            'action' => 'bail|unique:actions,name|max:20'
        ]);

        // $userId = $request->user()->id;
        $userId = 1;
        $s3Url = $this->uploadToS3($request);
        $videoId = $request->input('videoId');
        $charId = $request->input('charId');
        $actionId = $request->input('actionId', false);
        $action = $request->input('action');
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $hintOne = $request->input('hintOne');

        $scene = Scene::create([
            'video_id' => $videoId,
        ]);
        $scene->refresh();

        ScenePic::create([
            'scene_id' => $scene->id,
            'user_id' => $userId,
            's3_url' => $s3Url,
        ]);

        SceneCharacter::create([
            'scene_id' => $scene->id,
            'char_id' => $charId,
        ]);

        if ($actionId == 0) {
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

        $quizId = Str::random(8);
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

    public function answer(Request $request) {}

    public function hint(Request $request) {}
}
