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
        Schema::create('scene_tags', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('scene_id');
            $table->string('name');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('scene_id')->references('id')->on('scenes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scene_tags');
    }
};
