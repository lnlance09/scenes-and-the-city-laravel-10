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

        $phpPath = base_path() . '/public/assets/';
        $jsPath = base_path() . '/web-client-react/dist/assets/';

        $newJsFile = null;
        $newCssFile = null;
        $files = array_slice(scandir($jsPath), 2);
        for ($i = 0; $i < count($files); $i++) {
            if (substr($files[$i], -4) === '.css') {
                $newCssFile = $files[$i];
            }
            if (substr($files[$i], -3) === '.js') {
                $newJsFile = $files[$i];
            }
        }

        $oldJsFile = null;
        $oldCssFile = null;
        $files = array_slice(scandir($phpPath), 2);
        for ($i = 0; $i < count($files); $i++) {
            if (substr($files[$i], -4) === '.css') {
                $oldCssFile = $files[$i];
            }
            if (substr($files[$i], -3) === '.js') {
                $oldJsFile = $files[$i];
            }
        }

        exec('rm -r ' . $phpPath . '/*');
        exec('cp ' . $jsPath . '*  ' . $phpPath);
        // echo "Old JS File: " . $oldJsFile . "\n";
        // echo "New JS File: " . $newJsFile . "\n";
        $file = str_replace($oldCssFile, $newCssFile, $file);
        $file = str_replace($oldJsFile, $newJsFile, $file);
        file_put_contents($bladePath, $file);
    }
}
