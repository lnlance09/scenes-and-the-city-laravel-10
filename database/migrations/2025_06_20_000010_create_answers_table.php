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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('quiz_id');
            $table->unsignedBigInteger('user_id');
            $table->string('answer')->nullable()->default(null);
            $table->decimal('lat', 16, 8)->nullable()->default(null);
            $table->decimal('lng', 16, 8)->nullable()->default(null);
            $table->integer('hints_used')->default(0);
            $table->timestamps();

            $table->foreign('quiz_id')->references('id')->on('quizzes');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
