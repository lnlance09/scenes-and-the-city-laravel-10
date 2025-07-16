<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetBuildFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'build:files';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sets the CSS and JS files from react build into index.php file';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $bladePath = base_path() . '/resources/views/index.blade.php';
        $file = file_get_contents($bladePath);

        $publicPath = base_path() . '/public/static/';
        $cssFiles = array_slice(scandir($publicPath . 'css'), 2);
        $jsFiles = array_slice(scandir($publicPath . 'js'), 2);
        $mediaFiles = array_slice(scandir($publicPath . 'media'), 2);

        $basePath = base_path() . '/web-client-react/build/static/';
        $newCssFiles = array_slice(scandir($basePath . 'css/'), 2);
        $newJsFiles = array_slice(scandir($basePath . 'js/'), 2);
        $newMediaFiles = array_slice(scandir($basePath . 'media/'), 2);

        for ($i = 0; $i < count($newCssFiles); $i++) {
            $content = file_get_contents($basePath . 'css/' . $newCssFiles[$i]);
            file_put_contents($publicPath . 'css/' . $newCssFiles[$i], $content);
            if ($i < count($cssFiles) ? $cssFiles[$i] !== $newCssFiles[$i] : false) {
                exec('rm ' . $publicPath . 'css/' . $cssFiles[$i]);
            }
            $file = str_replace($cssFiles[$i], $newCssFiles[$i], $file);
        }

        for ($i = 0; $i < count($newJsFiles); $i++) {
            $content = file_get_contents($basePath . 'js/' . $newJsFiles[$i]);
            file_put_contents($publicPath . 'js/' . $newJsFiles[$i], $content);
            if ($i < count($jsFiles) ? $jsFiles[$i] !== $newJsFiles[$i] : false) {
                exec('rm ' . $publicPath . 'js/' . $jsFiles[$i]);
            }
            $file = str_replace($jsFiles[$i], $newJsFiles[$i], $file);
        }

        for ($i = 0; $i < count($newMediaFiles); $i++) {
            $content = file_get_contents($basePath . 'media/' . $newMediaFiles[$i]);
            file_put_contents($publicPath . 'media/' . $newMediaFiles[$i], $content);
            if ($i < count($mediaFiles) ? $mediaFiles[$i] !== $newMediaFiles[$i] && !empty($mediaFiles[$i]) : false) {
                exec('rm ' . $publicPath . 'media/' . $mediaFiles[$i]);
            }
            $file = str_replace($mediaFiles[$i], $newMediaFiles[$i], $file);
        }

        $content = file_get_contents(base_path() . '/web-client-react/build/asset-manifest.json');
        file_put_contents(base_path() . '/public/asset-manifest.json', $content);

        file_put_contents($bladePath, $file);
    }
}
