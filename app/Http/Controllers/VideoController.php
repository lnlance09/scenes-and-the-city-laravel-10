<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Http\Resources\VideoCollection as VideoCollection;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $q = $request->input('q');
        $type = $request->input('type', 1);

        $videos = Video::where('title', 'LIKE', '%' . $q . '%');
        if ($type == 2) {
            $videos = $videos->where('type', 2)->orWhere('type', 3);
        }
        if ($type != 5) {
            $videos = $videos->where('type', $type);
        }

        $videos = $videos->limit(25)->get();
        return new VideoCollection($videos);
    }
}
