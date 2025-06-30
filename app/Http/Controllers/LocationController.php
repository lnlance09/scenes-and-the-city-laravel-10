<?php

namespace App\Http\Controllers;

use App\Models\NewYorkCity;
use Illuminate\Http\Request;

class LocationController extends Controller
{

    public function find(Request $request)
    {
        $lng = $request->input('lng');
        $lat = $request->input('lat');

        $nyc = new NewYorkCity();
        // $check = $nyc->checkBorough('110422539839', 'brooklyn');
        // var_dump($check);
        // die;
        // $data = $nyc->cleanData();
        // echo json_encode($data);
        // $filter = $nyc->filterStreetsByDirection();
        $data = $nyc->deleteDuplicates();
        // $details = $nyc->getLocationDetails($lng, $lat);
        // $intersections = $nyc->getIntersections('manhattan');

        echo '<pre>';
        echo print_r($data);
        echo '</pre>';
        die;

        return response([
            'data' => $details
        ]);
    }
}
