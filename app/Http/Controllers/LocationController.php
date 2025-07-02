<?php

namespace App\Http\Controllers;

use App\Models\NewYorkCity;
use Illuminate\Http\Request;

class LocationController extends Controller
{

    public function find(Request $request)
    {
        ini_set('memory_limit', '2048M');
        ini_set('max_execution_time', 250);

        $lng = $request->input('lng');
        $lat = $request->input('lat');

        $nyc = new NewYorkCity();
        // echo $nyc->cleanUpData(1);
        // die;
        // echo $nyc->removeDuplicateStreets('bronx');
        // die;
        $details = $nyc->getLocationDetails($lng, $lat);
        if (!$details) {
            return response([
                'message' => "That location isn't in the five boroughs"
            ], 404);
        }

        return response([
            'data' => $details
        ]);
    }
}
