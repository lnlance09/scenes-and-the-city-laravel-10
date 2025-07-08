<?php

namespace Database\Seeders;

use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'email' => 'lnlance09@gmail.com',
            'password' => sha1('meaninglesspassword'),
            'username' => 'SATC_Official',
            'email_verified_at' => Carbon::now()->format('Y-m-d H:i:s'),
            'remember_token' => Str::random(10),
            'verification_code' => mt_rand(1000, 9999),
            'api_token' => bin2hex(random_bytes(32)),
        ]);
        Setting::factory()->create([
            'user_id' => $user->id
        ]);

        $verifiedUsers = User::factory()
            ->count(10)
            ->create();
        for ($i = 0; $i < count($verifiedUsers); $i++) {
            Setting::factory()->create([
                'user_id' => $verifiedUsers[$i]->id
            ]);
        }

        $unverifiedUsers = User::factory()
            ->unverified()
            ->count(10)
            ->create();
        for ($i = 0; $i < count($unverifiedUsers); $i++) {
            Setting::factory()->create([
                'user_id' => $unverifiedUsers[$i]->id
            ]);
        }
    }
}
