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
        Schema::create('character_pics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('char_id');
            $table->string('s3_url');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('char_id')->references('id')->on('characters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('character_pics');
    }
};
