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
        Schema::create('scene_characters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('scene_id');
            $table->unsignedBigInteger('character_id');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('scene_id')->references('id')->on('scenes');
            $table->foreign('character_id')->references('id')->on('characters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_characters');
    }
};
