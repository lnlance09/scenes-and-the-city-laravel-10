<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Http\Resources\CharacterCollection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CharacterController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index($videoId)
    {
        $chars = Character::where('video_id', $videoId)->get();
        return new CharacterCollection($chars);
    }
}
