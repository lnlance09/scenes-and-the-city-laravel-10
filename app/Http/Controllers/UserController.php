<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnswerCollection;
use App\Http\Resources\User as UserResource;
use App\Http\Resources\UserCollection as UserCollection;
use App\Mail\ForgotPassword;
use App\Mail\VerificationCode;
use App\Models\Answer;
use App\Models\Setting;
use App\Models\User;
use App\Http\Resources\Setting as SettingResource;
use App\Models\NewYorkCity;
use App\Rules\MatchOldPassword;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct() {}

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {}

    /**
     * Change username
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function channgeUsername(Request $request, User $user)
    {
        $user = $request->user();
        $input = $request->all();
        $username = $request->input('username', null);
        if ($username ? $username !== $user->username : false) {
            $request->validate([
                'username' => 'bail|required|max:20|unique:users,username|alpha_dash'
            ]);
        }
        $user->fill($input)->save();

        return response([
            'success' => true
        ]);
    }

    /**
     * Check availability of a username
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function checkUsername(Request $request)
    {
        $username = $request->input('username', null);
        $user = $request->user();
        if ($username === $user->username) {
            return response()->json([
                'available' => true
            ]);
        }
        $request->validate([
            'username' => 'bail|required|max:20|unique:users,username|alpha_dash'
        ]);
        return response([
            'available' => true
        ]);
    }

    /**
     * Login
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'bail|email',
            'username' => 'bail|min:3|alpha_dash',
            'password' => ['bail', 'required', Password::min(5)],
        ]);
        $password = sha1($request->input('password'));

        $user = User::where(function ($query) use ($request, $password) {
            $query->where(function ($query) use ($request, $password) {
                $query->where('email', '=', $request->input('email'));
                $query->where('password', '=', $password);
            })->orWhere(function ($query) use ($request, $password) {
                $query->where('username', '=', $request->input('username'));
                $query->where('password', '=', $password);
            });
        })->with(['setting'])->first();
        if (!$user) {
            return response([
                'message' => 'Incorrect password'
            ], 401);
        }
        return response([
            'user' => [
                'bearer' => $user->api_token,
                'username' => $user->username,
                'verified' => $user->email_verified_at === null,
                'settings' => new SettingResource($user->setting)
            ]
        ]);
    }

    /**
     * Register
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'bail|required|email|unique:users',
            'password' => ['bail', 'required', Password::min(8)],
            'username' => 'bail|required|max:20|min:3|unique:users,username|alpha_dash'
        ]);

        $email = $request->input('email');
        $password = $request->input('password');
        $username = $request->input('username');

        if (in_array(strtolower($username), User::PROTECTED_USERNAMES)) {
            return response([
                'errors' => [
                    'username' => [
                        'That username is invalid'
                    ]
                ]
            ], 422);
        }

        $user = User::create([
            'username' => $username,
            'email' => $email,
            'password' => sha1($password),
            'remember_token' => Str::random(10),
            'verification_code' => mt_rand(1000, 9999),
            'api_token' => bin2hex(random_bytes(32)),
        ]);
        $user->refresh();

        $setting = Setting::create([
            'user_id' => 1
        ]);
        $setting->refresh();

        /*
        try {
            Mail::to($email)->send(new VerificationCode($user));
        } catch (Exception $e) {
            Log::error($e);
            return response([
                'message' => 'Error sending confirmation email'
            ], 401);
        }
        */

        return response([
            'user' => [
                'username' => $user->username,
                'settings' => new SettingResource($setting)
            ]
        ]);
    }

    /**
     * Verify
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|numeric',
        ]);
        $user = $request->user();
        $code = $request->input('code');
        if ($user->verification_code != $code) {
            return response([
                'message' => 'That code is incorrect'
            ], 401);
        }

        $user->email_verified_at = now();
        $user->save();

        return response([
            'verify' => false
        ]);
    }

    /**
     * Forgot password
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function forgot(Request $request)
    {
        $request->validate([
            'email' => 'bail|email',
            'username' => 'bail|max:20|min:3|alpha_dash'
        ]);
        $email = $request->input('email');
        $username = $request->input('username');

        $user = User::where('email', $email)
            ->orWhere('username', $username)
            ->first();
        if (empty($user)) {
            return response([
                'message' => 'No user found'
            ], 401);
        }

        $forgotCode = Str::random(12);
        $user->forgot_code = $forgotCode;
        $user->save();
        $user->refresh();

        try {
            Mail::to($email)->send(new ForgotPassword($user));
        } catch (Exception $e) {
            return response([
                'message' => 'Error sending recovery email'
            ], 401);
        }

        return response([
            'message' => 'Success'
        ]);
    }

    /**
     * Recover password
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function recoverPassword(Request $request)
    {
        $request->validate([
            'reset' => 'required',
            'newPassword' => ['required', Password::min(8)],
            'confirmPassword' => ['same:newPassword']
        ]);
        $password = $request->input('newPassword');
        $reset = $request->input('reset');

        $user = User::where('forgot_code', $reset)->first();
        if (empty($user)) {
            return response([
                'message' => 'Incorrect token'
            ], 401);
        }

        $user->password = $password;
        $user->forgot_code = null;
        $user->save();
        $user->refresh();

        return response([
            'success' => true
        ]);
    }

    /**
     * Change password
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'currentPassword' => ['required', new MatchOldPassword],
            'newPassword' => ['required', Password::min(8)],
            'confirmPassword' => ['same:newPassword']
        ]);
        $password = $request->input('newPassword');
        $user = $request->user();
        $user->password = $password;
        $user->save();
        $user->refresh();

        return response([
            'success' => true
        ]);
    }

    /**
     * Update settings
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'darkMode' => 'bail|integer|min:0|max:1',
            'hardMode' => 'bail|integer|min:0|max:1',
            'reveal' => 'bail|integer|min:0|max:1',
        ]);

        $darkMode = $request->input('darkMode', null);
        $hardMode = $request->input('hardMode', null);
        $lang = $request->input('lang', null);
        $reveal = $request->input('reveal', null);
        $units = $request->input('units', null);

        $userId = $request->user()->id;
        $setting = Setting::where('user_id', $userId)->first();

        if ($darkMode !== null) {
            $setting->dark_mode = $darkMode;
        }
        if ($hardMode !== null) {
            $setting->hard_mode = $hardMode;
        }
        if (in_array($lang, ['en', 'es', 'cn'])) {
            $setting->lang = $lang;
        }
        if ($reveal !== null) {
            $setting->reveal_answers = $reveal;
        }
        if (in_array($units, ['miles', 'kilometers'])) {
            $setting->measure_units_in = $units;
        }
        $setting->save();

        return response([
            'success' => true
        ]);
    }

    /**
     * Update settings
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function getStats(Request $request)
    {
        $userId = $request->user()->id;

        $correctAnswers = Answer::where(
            [
                'user_id' => $userId,
                'correct' => 1
            ]
        )->count();
        $incorrectAnswers = Answer::where(
            [
                'user_id' => $userId,
                'correct' => 0
            ]
        )->count();
        $totalAnswers = $incorrectAnswers + $correctAnswers;
        $accuracy = $totalAnswers === 0 ? 0 : $correctAnswers / $totalAnswers;

        $allAnswers = Answer::where('user_id', $userId)->get();
        $currentStreak = 0;
        for ($i = 0; $i < count($allAnswers); $i++) {
            if ($allAnswers[$i]->correct === 0) {
                break;
            }
            if ($allAnswers[$i]->correct === 1) {
                $currentStreak++;
            }
        }

        $answers = Answer::where('user_id', $userId)->with(['quiz'])->get();
        $nyc = new NewYorkCity();
        $margin = 0;
        $count = count($answers);
        for ($i = 0; $i < $count; $i++) {
            $a = $answers[$i];
            $answerLocation = $nyc->locationToObject('Point', $a->lng, $a->lat);
            $quizLocation = $nyc->locationToObject('Point', $a->quiz->lng, $a->quiz->lat);
            $margin += $quizLocation->distance($answerLocation);
        }
        $marginOfError = $count === 0 ? $margin : $margin / $count;

        return response([
            'totalAnswers' => $totalAnswers,
            'correctAnswers' => $correctAnswers,
            'accuracy' => $accuracy,
            'currentStreak' => $currentStreak,
            'maxStreak' => '',
            'margin' => $marginOfError
        ]);
    }

    /**
     * Update settings
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user
     * @return \Illuminate\Http\Response
     */
    public function getHistory(Request $request)
    {
        $userId = $request->user()->id;
        $answers = Answer::where('user_id', $userId)
            ->with(['quiz'])
            ->get();
        return new AnswerCollection($answers);
    }
}
