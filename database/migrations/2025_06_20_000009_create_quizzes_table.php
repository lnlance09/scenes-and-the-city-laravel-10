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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('scene_id');
            $table->unsignedBigInteger('user_id');
            $table->boolean('is_official')->default(false);
            $table->string('quiz_id')->unique();
            $table->string('hint_one');
            $table->string('hint_two');
            $table->decimal('lat', 16, 8);
            $table->decimal('lng', 16, 8);
            $table->timestamps();

            $table->foreign('scene_id')->references('id')->on('scenes');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
