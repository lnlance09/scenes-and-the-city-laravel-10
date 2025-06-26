<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('verification_code')->after('password');
            $table->string('forgot_code')->nullable()->default(null)->after('verification_code');
            $table->string('api_token')->after('forgot_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->drop('verification_code');
            $table->drop('forgot_code');
            $table->drop('api_token');
        });
    }
};
