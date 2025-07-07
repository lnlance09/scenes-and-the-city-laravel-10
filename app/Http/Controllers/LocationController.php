<?php

namespace App\Http\Controllers;

use App\Models\NewYorkCity;
use Illuminate\Http\Request;

class LocationController extends Controller
{

    public function find(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric|between:40.4989,40.9130',
            'lng' => 'required|numeric|between:-74.2527,-73.70165',
        ]);
        $lng = $request->input('lng');
        $lat = $request->input('lat');

        $nyc = new NewYorkCity();
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
