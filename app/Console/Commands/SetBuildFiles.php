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
        $phpPath = base_path() . '/public/static/';
        $jsBundleFile = base_path() . '/web-client-cra/build/static/js/bundle.js';
        $jsBundleMapFile = base_path() . '/web-client-cra/build/static/js/bundle.js.map';
        $mediaFolder = base_path() . '/web-client-cra/build/static/media/';

        // Delete old files
        exec('rm -r ' . $phpPath . 'js/*');
        exec('rm -r ' . $phpPath . 'media/*');

        // Copy new ones
        exec('cp ' . $jsBundleFile . '  ' . $phpPath . 'js/bundle.js');
        exec('cp ' . $jsBundleMapFile . '  ' . $phpPath . 'js/bundle.js.map');
        exec('cp ' . $mediaFolder . '*  ' . $phpPath . 'media/');
    }
}
