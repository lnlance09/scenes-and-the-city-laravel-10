<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $seeders = [
            // UserSeeder::class,
            VideoSeeder::class,
            ActorSeeder::class,
            CharacterSeeder::class,
            // ActionSeeder::class,
            // SceneSeeder::class,
            // ScenePicSeeder::class,
            // SceneCharacterSeeder::class,
            // SceneActionSeeder::class,
            // QuizSeeder::class,
            // AnswerSeeder::class
        ];
        $this->call($seeders);
    }
}
