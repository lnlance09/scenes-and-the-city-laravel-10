<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\User as UserResource;
use App\Http\Resources\UserCollection as UserCollection;
use App\Mail\ForgotPassword;
use App\Mail\VerificationCode;
use App\Models\User;
use App\Rules\MatchOldPassword;
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

        return response()->json([
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
        return response()->json([
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
            'email' => 'bail|required|email',
            'password' => 'required',
        ]);
        $user = User::where([
            'email' => $request->input('email'),
            'password' => sha1($request->input('password'))
        ])->first();
        if (!$user) {
            return response([
                'message' => 'Incorrect password'
            ], 401);
        }
        return response()->json([
            'bearer' => $user->api_token,
            'user' => new UserResource($user),
            'verify' => $user->email_verified_at === null
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
            'username' => 'bail|required|max:20|unique:users,username|alpha_dash'
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

        /*
        try {
            Mail::to($email)->send(new VerificationCode($user));
        } catch (\Exception $e) {
            Log::error($e);
            return response([
                'message' => 'Error sending confirmation email'
            ], 401);
        }
        */

        return response()->json([
            'bearer' => $user->api_token,
            'user' => new UserResource($user)
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

        return response()->json([
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
            'email' => 'required|email',
        ]);
        $email = $request->input('email');
        $user = User::where('email', $email)->first();

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
        } catch (\Exception $e) {
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

        return response()->json([
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

        return response()->json([
            'success' => true
        ]);
    }
}
