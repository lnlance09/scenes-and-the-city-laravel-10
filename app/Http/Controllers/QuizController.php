<?php

namespace App\Http\Controllers;

use App\Models\Action;
use App\Models\Answer;
use App\Models\Character;
use App\Models\NewYorkCity;
use App\Models\Quiz;
use App\Models\Scene;
use App\Models\ScenePic;
use App\Models\SceneAction;
use App\Models\SceneCharacter;
use App\Models\User;
use App\Http\Resources\Quiz as QuizResource;
use App\Models\QuizPartTwo;
use Brick\Geo\Engine\GeosEngine;
use Brick\Geo\Point;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
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
     * @param Request $request
     * @param  String  $quizId
     * @return Response
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
     * @param  Request  $request
     * @return Response
     */
    public function showByDate(Request $request)
    {
        $user = $request->user('api');
        $request->validate([
            'date' => 'required|date_format:n-j-Y',
        ]);
        $date = $request->input('date');
        $today = Carbon::createFromFormat('n-j-Y', $date)->format('Y-m-d');

        $quiz = Quiz::where([
            'user_id' => Self::OFFICIAL_USER_ID,
            'is_official' => true
        ])
            ->whereBetween('created_at', [
                $today . ' 00:00:00',
                $today . ' 23:59:59'
            ])
            ->with(['partTwo.partTwo'])
            ->first();
        if (empty($quiz)) {
            return response([
                'message' => 'That quiz does not exist'
            ], 404);
        }

        return $this->formatResponse($quiz, $user);
    }

    /**
     * @param Quiz
     * @param User
     * @return Response
     */
    public function formatResponse($quiz, $user)
    {
        $nyc = new NewYorkCity();
        $geos = new GeosEngine();

        $answerData = [
            'correct' => null,
            'geoData' => [
                'lat' => 40.758896,
                'lng' => -73.98513,
                'hood' => 'Theater District',
                'borough' => 'Manhattan',
                'streets' => ['Broadway', '7th Ave', 'W 46th St']
            ],
            'marginOfError' => null,
            'hintsUsed' => 0,
            'hasAnswered' => false
        ];

        $partTwo = null;
        $partTwoResource = null;
        $hasPartTwo = !is_null($quiz->partTwo);

        if ($hasPartTwo) {
            $partTwo = $quiz->partTwo->partTwo;
            $quizLocation = Point::xy($quiz->lng, $quiz->lat);
            $partTwoLocation = Point::xy($partTwo->lng, $partTwo->lat);
            $partTwo->distance = $geos->distance($quizLocation, $partTwoLocation);
            $partTwoResource = new QuizResource($partTwo);
        }

        // If the user's logged in, see if they've answered it
        if ($user) {
            $answer = Answer::where([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id
            ])->first();
            if (empty($answer)) {
                return response([
                    'quiz' => new QuizResource($quiz),
                    'partTwo' => $partTwoResource,
                    'answer' => $answerData
                ]);
            }

            $geoData = $nyc->getLocationDetails($quiz->lng, $quiz->lat);
            $geoData['lng'] = (float)$quiz->lng;
            $geoData['lat'] = (float)$quiz->lat;

            $quiz->geo_data = $geoData;
            $createdAt = new Carbon($quiz->created_at);
            $quiz->reveal_answer = Carbon::now()->diffInDays($createdAt->startOfDay()) > 0;

            $lng = $answer->lng;
            $lat = $answer->lat;
            if ($lng != 0 && $lat != 0) {
                $geoData = $nyc->getLocationDetails($lng, $lat);
                $geoData['lng'] = $lng;
                $geoData['lat'] = $lat;
                $answerData['geoData'] = $geoData;
            }

            $answerData['correct'] = $answer->correct === 1;
            $answerData['hintsUsed'] = $answer->hints_used;
            $answerData['marginOfError'] = $answer->margin_of_error;
            $answerData['hasAnswered'] = true;

            if ($answer->hints_used == 2) {
                $quiz->hint_two = $quiz->hint_one;
                $quiz->reveal_hint_two = true;
            }

            if ($answer->hints_used >= 1) {
                $details = $nyc->getLocationDetails($quiz->lng, $quiz->lat);
                $quiz->hint_one = $details['hood'];
                $quiz->reveal_hint_one = true;
            }
        }

        return response([
            'quiz' => new QuizResource($quiz),
            'partTwo' => $partTwoResource,
            'answer' => $answerData
        ]);
    }

    /**
     * @param Request $request
     * @param String $quizId
     * @return String $s3Url
     */
    private function uploadToS3(Request $request, String $quizId)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif',
        ]);
        $file = $request->file('file');

        $manager = new ImageManager(new Driver());
        $img = $manager->read($file);
        // $img->resize(320, 320);
        $img->save($file);

        $s3Url = "quizzes/" . $quizId . ".jpg";
        Storage::disk('s3')->put($s3Url, file_get_contents($file));
        return $s3Url;
    }

    /**
     * Show the form for creating a new resource.
     *
     * @param  Request  $request
     * @return Response
     */
    public function create(Request $request)
    {
        $userId = $request->user()?->id;
        $request->validate([
            'videoId' => 'bail|required|exists:videos,id',
            'charId' => 'bail|required|exists:characters,id',
            'action' => 'bail|unique:actions,name|max:50',
            'actionId' => 'bail|exists:actions,id',
            'hint' => 'bail|required|min:3|max:50',
            'partTwo' => 'bail|exists:quizzes,quiz_id'
        ]);

        $videoId = $request->input('videoId');
        $charId = $request->input('charId');
        $actionId = $request->input('actionId', false);
        $action = $request->input('action', null);
        $lat = $request->input('lat', null);
        $lng = $request->input('lng', null);
        $hint = $request->input('hint');
        $partTwo = $request->input('partTwo', false);
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
                'name' => substr($action, -1) === '.' ? substr($action, 0, -1) : $action
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

        $quiz = Quiz::create([
            'scene_id' => $scene->id,
            'user_id' => $userId,
            'is_official' => $userId === 1,
            'quiz_id' => $quizId,
            'img' => $s3Url,
            'hint_one' => $hint,
            'hint_two' => '',
            'lat' => $lat,
            'lng' => $lng
        ]);
        $quiz->refresh();

        if ($partTwo) {
            $partTwoId = Quiz::where('quiz_id', $partTwo)->first()->id;
            QuizPartTwo::create([
                'quiz_id_one' => $quiz->id,
                'quiz_id_two' => $partTwoId
            ]);
        }

        return response([
            'quiz' => $quizId
        ], 201);
    }

    private function validateQuiz(Request $request, String $quizId)
    {
        $userId = $request->user()?->id;
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
        $createdAt = new Carbon($quiz->created_at);
        if (Carbon::now()->diffInDays($createdAt->startOfDay()) > 0) {
            return [
                'message' => 'This quiz has expired',
                'error' => true,
                'code' => 422
            ];
        }
        return [
            'id' => $quiz->id,
            'error' => false
        ];
    }

    /**
     * 
     * @param Request $request
     * @param String $quizId
     * @return Response
     */
    public function answer(Request $request, String $quizId)
    {
        $userId = $request->user()?->id;
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

    /**
     * 
     * @param Request $request
     * @param String $quizId
     * @return Response
     */
    public function hint(Request $request, String $quizId)
    {
        $userId = $request->user()?->id;
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

    /**
     * 
     * @param Request $request
     */
    public function leaderboard(Request $request) {}
}
