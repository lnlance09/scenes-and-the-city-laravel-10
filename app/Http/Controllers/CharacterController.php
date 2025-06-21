<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Http\Resources\CharacterCollection as CharacterCollection;
use Illuminate\Http\Request;

class CharacterController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($videoId)
    {
        $chars = Character::where('video_id', $videoId)->get();
        return new CharacterCollection($chars);
    }
}
