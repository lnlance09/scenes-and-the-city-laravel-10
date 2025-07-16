<?php

use App\Models\Quiz;
use Carbon\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;

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

$awsUrl = env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/');
$baseUrl = env('APP_URL', 'https://scenesandthecity.com/');
$siteName = env('APP_NAME', 'Scenes and the City');

$seo = [
    'author' => null,
    'authorUrl' => null,
    'awsUrl' => $awsUrl,
    'baseUrl' => $baseUrl,
    'description' => $siteName . ' is a visual based trivia game where players guess the locations of scenes from movies, tv shows, and music videos',
    'img' => [
        'height' => 313,
        'width' => 313,
        'src' => $awsUrl . 'public/film.png'
    ],
    'keywords' => 'sex and the city,trivia,pop culture,movies,tv shows,music videos,jeopardy',
    'schema' => '',
    'siteName' => $siteName,
    'title' => $siteName,
    'url' => $baseUrl
];

Route::get('/', function () use ($seo) {
    $seo['title'] = $seo['siteName'];
    return view('index', $seo);
});

Route::get('/{quizId}', function ($quizId) use ($seo) {
    $quiz = Quiz::where('quiz_id', $quizId)->first();
    if (empty($quiz)) {
        return view('index', $seo);
    }

    $img = $seo['awsUrl'] . $quiz->img;
    $imgData = getimagesize($img);
    $seo['img'] = [
        'src' => $img,
        'height' => $imgData[1],
        'width' => $imgData[0]
    ];
    $seo['description'] = '';
    $seo['url'] = $seo['baseUrl']  . $quizId;
    return view('index', $seo);
});

Route::get('sitemap', function () {
    $sitemap = App::make('sitemap');
    $sitemap->setCache('laravel.sitemap', 60);

    if (!$sitemap->isCached()) {
        // home page
        $sitemap->add(URL::to('/'), Carbon::now()->subMinutes(52), '1.0', 'daily');

        // quizzes
        $quizzes = DB::table('quizzes')->orderBy('id', 'asc')->get();
        foreach ($quizzes as $q) {
            $sitemap->add(URL::to('/quizzes/' . $q->quiz_id), $q->updated_at, '0.8', 'daily');
        }
    }

    return $sitemap->render('xml');
});
