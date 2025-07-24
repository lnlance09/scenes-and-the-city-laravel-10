<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CharacterPic;
use App\Http\Resources\CharacterCollection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class CharacterController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param Integer $videoId
     * @return CharacterCollection
     */
    public function index(Int $videoId)
    {
        $chars = Character::where('video_id', $videoId)->get();
        return new CharacterCollection($chars);
    }

    /**
     * Create a pic for a character.
     *
     * @param Request $request
     * @return Response
     */
    public function createPic(Request $request)
    {
        $userId = $request->user()->id;
        if ($userId !== 1) {
            return response([
                'error' => 'You do not have access to this resource'
            ], 401);
        }

        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif',
            'charId' => 'bail|required|exists:characters,id',
        ]);
        $file = $request->file('file');
        $charId = $request->input('charId');

        $manager = new ImageManager(new Driver());
        $img = $manager->read($file);
        $img->resize(250, 250);
        $img->save($file);

        $s3Url = "chars/" . $charId . ".jpg";
        Storage::disk('s3')->put($s3Url, file_get_contents($file));
        CharacterPic::create([
            'character_id' => $charId,
            's3_url' => $s3Url
        ]);

        return response([
            's3Url' => env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/') . $s3Url
        ]);
    }
}
