<?php

namespace App\Console\Commands;

use App\Models\Quiz;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:sitemap';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generates a sitemap';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // https://github.com/spatie/laravel-sitemap
        $baseUrl = env('APP_URL', 'https://scenesandthecity.com/');
        $awsUrl = env('AWS_URL', 'https://scenes-and-the-city.s3.us-west-2.amazonaws.com/');

        $sitemap = Sitemap::create();
        $sitemap->add(Url::create($baseUrl));

        $quizzes = Quiz::all();
        foreach ($quizzes as $q) {
            $img = $awsUrl . $q->scene->pics[0]->s3_url;
            $url = URL::create($baseUrl . $q->quiz_id);
            $url = $url->addImage($img, '');
            // $url = $url->addVideo($img, 'Video', 'Video Description', 'https://example.com/videos/source.mp4');
            $time = Carbon::createFromFormat('Y-m-d H:i:s', $q->created_at);

            $sitemap->add(
                $url->setLastModificationDate($time)
            );
        }
        $sitemap->writeToFile('sitemap.xml');
    }
}
