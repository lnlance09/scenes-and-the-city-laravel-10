<?php

use Illuminate\Http\Request;
use App\Http\Controllers\ActionController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/actions', [ActionController::class, 'index']); // 
Route::get('/videos', [VideoController::class, 'index']); // 
Route::get('/chars/{videoId}', [CharacterController::class, 'index']); //
Route::post('/chars/pic', [CharacterController::class, 'createPic'])->middleware(['auth:api', 'verified']); //

Route::get('/location', [LocationController::class, 'find']); //

Route::get('/quiz/{quizId}', [QuizController::class, 'show']); //
Route::get('/quiz/show/date', [QuizController::class, 'showByDate']); //
Route::post('/quiz/submit', [QuizController::class, 'create'])->middleware(['auth:api', 'verified']); // 
Route::post('/quiz/hint/{quizId}', [QuizController::class, 'hint'])->middleware(['auth:api', 'verified']); // 
Route::post('/quiz/answer/{quizId}', [QuizController::class, 'answer'])->middleware(['auth:api', 'verified']); //

Route::get('/users/changePassword', [UserController::class, 'changePassword'])->middleware(['auth:api', 'verified']);
Route::get('/users/changeUsername', [UserController::class, 'changeUsername'])->middleware(['auth:api', 'verified']);
Route::get('/users/checkUsername', [UserController::class, 'checkUsername'])->middleware(['auth:api', 'verified']);
Route::get('/users/quizzes', [UserController::class, 'getOfficialQuizzes'])->middleware(['auth:api', 'verified']);
Route::get('/users/history', [UserController::class, 'getHistory'])->middleware(['auth:api', 'verified']);
Route::get('/users/stats', [UserController::class, 'getStats'])->middleware(['auth:api', 'verified']);
Route::post('/users/settings', [UserController::class, 'updateSettings'])->middleware(['auth:api', 'verified']);
Route::post('/users/login', [UserController::class, 'login']); // 
Route::post('/users/register', [UserController::class, 'register']); // 
Route::post('/users/forgot', [UserController::class, 'forgot']); // 
Route::post('/users/recover', [UserController::class, 'recoverPassword']);
Route::post('/users/verify', [UserController::class, 'verify'])->middleware('auth:api'); // 
