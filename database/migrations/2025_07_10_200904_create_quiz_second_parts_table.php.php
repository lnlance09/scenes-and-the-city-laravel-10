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
        Schema::create('quiz_second_parts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quiz_id_one');
            $table->unsignedBigInteger('quiz_id_two');
            $table->timestamps();

            $table->foreign('quiz_id_one')->references('id')->on('quizzes');
            $table->foreign('quiz_id_two')->references('id')->on('quizzes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
