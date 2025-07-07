<?php

namespace App\Http\Controllers;

use App\Http\Resources\Answer as AnswerResource;
use App\Http\Resources\Quiz as QuizResource;
use App\Models\Action;
use App\Models\Answer;
use App\Models\Character;
use App\Models\NewYorkCity;
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

    /**
     * Display the specified resource.
     *
     * @param  String  $slug
     * @return QuizResource
     */
    public function show(Request $request, String $quizId)
    {
        $user = $request->user('api');
        $quiz = Quiz::where('quiz_id', $quizId)->first();
        if (empty($quiz)) {
            return response([
                'message' => 'That quiz does not exist'
            ], 404);
        }

        return $this->formatResponse($quiz, $user);
    }

    /**
     * Display the specified resource.
     *
     * @param  String  $slug
     * @return QuizResource
     */
    public function showByDate(Request $request)
    {
        $user = $request->user('api');
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

        return $this->formatResponse($quiz, $user);
    }

    public function formatResponse($quiz, $user)
    {
        $text = $quiz->generateQuestion();
        $response = [
            'quiz' => [
                'quizId' => $quiz->quiz_id,
                'img' => env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/') . $quiz->scene->pics[0]->s3_url,
                'username' => $quiz->user->username,
                'text' => $text,
                'createdAt' => $quiz->created_at
            ],
        ];

        if ($user) {
            $answer = Answer::where([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id
            ])->first();
            $response['answer'] = null;

            if (!empty($answer)) {
                $geoData = [
                    'borough' => null,
                    'hood' => null,
                    'streets' => []
                ];
                if (!is_null($answer->lng) && !is_null($answer->lat)) {
                    $nyc = new NewYorkCity();
                    $geoData = $nyc->getLocationDetails($answer->lng, $answer->lat);
                }

                $geoData['lat'] = is_null($answer->lat) ? 40.758896 : $answer->lat;
                $geoData['lng'] = is_null($answer->lng) ? -73.98513 : $answer->lng;
                $geoData['hintsUsed'] = $answer->hints_used;
                $response['answer'] = $geoData;

                if ($answer->hints_used >= 1) {
                    $nyc = new NewYorkCity();
                    $details = $nyc->getLocationDetails($quiz->lng, $quiz->lat);
                    $response['quiz']['hintOne'] = $details['hood'];
                    return response($response);
                }

                if ($answer->hints_used == 2) {
                    $response['quiz']['hintTwo'] = $quiz->hint_one;
                    return response($response);
                }
            }
        }

        return response($response);
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
        $s3Url = "quizzes/" . $quizId . ".jpg";
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
            'action' => 'bail|unique:actions,name|max:30',
            'actionId' => 'bail|exists:actions,id',
            'hint' => 'bail|required|min:3|max:20'
        ]);

        $userId = $request->user()->id;
        $videoId = $request->input('videoId');
        $charId = $request->input('charId');
        $actionId = $request->input('actionId', false);
        $action = $request->input('action', null);
        $lat = $request->input('lat', null);
        $lng = $request->input('lng', null);
        $hint = $request->input('hint');
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
            'hint_one' => $hint,
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
        $quiz = Quiz::where('quiz_id', $quizId)->first();
        if (!$quiz) {
            return [
                'message' => 'The quiz does not exist',
                'error' => true,
                'code' => 404
            ];
        }
        if ($quiz->user_id == $userId) {
            return [
                'message' => 'You cannot answer your own quiz',
                'error' => true,
                'code' => 422
            ];
        }
        return [
            'id' => $quiz->id,
            'error' => false
        ];
    }

    public function answer(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $valid = $this->validateQuiz($request, $quizId);
        if ($valid['error']) {
            return response([
                'message' => $valid['message']
            ], $valid['code']);
        }

        $lat = $request->input('lat');
        $lng = $request->input('lng');

        Answer::updateOrCreate([
            'quiz_id' => $valid['id'],
            'user_id' => $userId
        ], [
            'lat' => $lat,
            'lng' => $lng,
            'answer' => ''
        ]);

        return response([
            'message' => 'Success'
        ]);
    }

    public function hint(Request $request, String $quizId)
    {
        $userId = $request->user()->id;
        $valid = $this->validateQuiz($request, $quizId);
        if ($valid['error']) {
            return response([
                'message' => $valid['message']
            ], $valid['code']);
        }

        $number = $request->input('number', null);
        $where = [
            'quiz_id' => $valid['id'],
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

        $quiz = Quiz::find($valid['id'])->first();

        if ($number == 1) {
            $nyc = new NewYorkCity();
            $details = $nyc->getLocationDetails($quiz->lng, $quiz->lat);
            return response([
                'hint' => $details['hood']
            ]);
        }

        if ($number == 2) {
            return response([
                'hint' => $quiz->hint_one
            ]);
        }

        return response([
            'message' => 'Unknown hint number'
        ], 404);
    }

    public function leaderboard(Request $request) {}
}
