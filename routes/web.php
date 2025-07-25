<?php

use App\Models\Quiz;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;

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
    'schema' => '',
    'siteName' => $siteName,
    'title' => $siteName,
    'url' => $baseUrl
];
$phrase = "Can you guess where in the city this scene was filmed?";

function validateDate($date, $format = 'Y-m-d')
{
    $d = DateTime::createFromFormat($format, $date);
    return $d && strtolower($d->format($format)) === strtolower($date);
}

function formatSeo(Quiz $quiz, string $slug, array $seo)
{
    $img = $seo['awsUrl'] . $quiz->scene->pics[0]->s3_url;
    $data = @getimagesize($img);
    if ($data) {
        $seo['img'] = [
            'src' => $img,
            'height' => $data[1],
            'width' => $data[0]
        ];
    }
    $seo['url'] = $seo['baseUrl'] . $slug;
    return $seo;
}

// Index page
Route::get('/', function () use ($seo, $siteName, $phrase) {
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
    $question = $quiz->generateQuestion();
    $seo = formatSeo($quiz, $today, $seo);
    $seo['title'] = $now->format('l, F j, Y') . ' - ' . $siteName;
    $seo['description'] = $question . " " . $phrase;
    return view('index', $seo);
});

// Quiz id or date
Route::get('/{quizId}', function ($quizId) use ($seo, $siteName, $phrase) {
    $validQuizId = Quiz::isValidId($quizId);
    if ($validQuizId) {
        $quiz = Quiz::where('quiz_id', $quizId)->first();
    }
    if (validateDate($quizId, 'n-j-y')) {
        $now = Carbon::createFromFormat('n-j-y', $quizId);
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
    }
    if (empty($quiz)) {
        return view('index', $seo);
    }
    $question = $quiz->generateQuestion();
    $seo = formatSeo($quiz, $quizId, $seo);

    if ($validQuizId) {
        $seo['title'] = 'Quiz by ' . $quiz->user->username . ' - ' . $siteName;
    } else {
        $seo['title'] = $now->format('l, F j, Y') . ' - ' . $siteName;
    }

    $seo['description'] = $question . " " . $phrase;
    return view('index', $seo);
});
