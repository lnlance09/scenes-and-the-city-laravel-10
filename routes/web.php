<?php

use App\Models\Quiz;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

$awsUrl = env('AWS_URL', 'https://scenes-and-the-city.s3.us-west-2.amazonaws.com/');
$baseUrl = env('APP_URL', 'https://scenesandthecity.com/');
$siteName = env('APP_NAME', 'Scenes and the City');
$seo = [
    'awsUrl' => $awsUrl,
    'baseUrl' => $baseUrl,
    'description' => $siteName . ' is a visual based trivia game where players guess the locations of scenes from movies, tv shows, and music videos',
    'img' => [
        'height' => 313,
        'width' => 313,
        'src' => $awsUrl . 'public/film.png'
    ],
    'keywords' => 'sex and the city, trivia, pop culture, movies, tv shows, music videos, jeopardy',
    'phrase' => "Can you guess where in the city this scene was filmed?",
    'schema' => '',
    'siteName' => $siteName,
    'title' => $siteName,
    'url' => $baseUrl
];

// Index page
Route::get('/', function () use ($seo, $siteName) {
    $now = Carbon::now();
    $today = $now->format('Y-m-d');
    $quiz = Quiz::where([
        'user_id' => 1,
        'is_official' => true
    ])
        ->whereBetween('created_at', [
            $today . ' 00:00:00',
            $today . ' 23:59:59'
        ])
        ->with(['partTwo.partTwo'])
        ->first();
    if (empty($quiz)) {
        return view('index', $seo);
    }
    $seo['title'] = $now->format('l, F j, Y') . ' - ' . $siteName;
    $question = $quiz->generateQuestion();
    $seo['description'] = $question . " " . $seo['phrase'];

    $s3Url = $seo['awsUrl'] . $quiz->scene->pics[0]->s3_url;
    $manager = new ImageManager(new Driver());
    $img = $manager->read(file_get_contents($s3Url));
    $seo['img'] = [
        'src' => $s3Url,
        'height' => $img->height(),
        'width' => $img->width()
    ];
    $seo['url'] = $seo['baseUrl'] . $today;
    return view('index', $seo);
});

// Quiz id or date
Route::get('/{quizId}', function ($quizId) use ($seo, $siteName) {
    $validQuizId = Quiz::isValidId($quizId);
    if ($validQuizId) {
        $quiz = Quiz::where('quiz_id', $quizId)->first();
    }
    if (Quiz::isValidDate($quizId, 'n-j-Y')) {
        $now = Carbon::createFromFormat('n-j-Y', $quizId);
        $today = $now->format('Y-m-d');
        $quiz = Quiz::where([
            'user_id' => 1,
            'is_official' => 1
        ])
            ->whereBetween('created_at', [
                $today . ' 00:00:00',
                $today . ' 23:59:59'
            ])
            ->with(['partTwo.partTwo'])
            ->first();
    }
    if (empty($quiz)) {
        return view('index', $seo);
    }

    if ($validQuizId) {
        $seo['title'] = 'Quiz by ' . $quiz->user->username . ' - ' . $siteName;
    } else {
        $seo['title'] = $now->format('l, F j, Y') . ' - ' . $siteName;
    }
    $question = $quiz->generateQuestion();
    $seo['description'] = $question . " " . $seo['phrase'];

    $s3Url = $seo['awsUrl'] . $quiz->scene->pics[0]->s3_url;
    $manager = new ImageManager(new Driver());
    $img = $manager->read(file_get_contents($s3Url));
    $seo['img'] = [
        'src' => $s3Url,
        'height' => $img->height(),
        'width' => $img->width()
    ];
    $seo['url'] = $seo['baseUrl'] . $quizId;
    return view('index', $seo);
});
