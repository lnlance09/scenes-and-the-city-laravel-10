<?php

namespace App\Models;

use App\Geolocation\geoPHP;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

class NewYorkCity extends Model
{
    public $boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten'];
    public $parks = [];
    public $bridges = [];
    public $tunnels = [];
    public $buildings = [];
    public $subwayStops = [];
    public $subwayLines = [];
    public $neighborhoods = [];
    public $avenues = [];
    public $streets = [];

    function __construct() {}


    public function isInBorough($lng, $lat, $borough = 'manhattan')
    {
        $geoJson = File::json(resource_path('geoJSON/boroughs/' . $borough . '.geojson'));
        $location = $this->locationToObject('Point', $lng, $lat);
        $borough = geoPHP::load(json_encode($geoJson), 'json');
        return $location->within($borough);
    }

    public function getNeighborhood($lng, $lat, $borough)
    {
        $geoJson = File::json(resource_path('geoJSON/boroughs/' . $borough . '.geojson'));
        $neighborhoods = $geoJson['features'];
        $location = $this->locationToObject('Point', $lng, $lat);
        foreach ($neighborhoods as $hood) {
            $hoodArea = geoPHP::load(json_encode($hood), 'json');
            if ($location->within($hoodArea)) {
                $hoodName = $hood['properties']['name'];
                return $hoodName;
            }
        }
        return false;
    }

    public function getClosestStreet($lng, $lat, $borough, $ignore = [], $intersectsWith = null)
    {
        $file = File::json(resource_path('./geoJSON/boroughs/streets/' . $borough . '.geojson'));
        $location = $this->locationToObject('Point', $lng, $lat);
        $streets = $file['features'];
        $shortestDistance = 0;
        $index = 0;

        for ($i = 0; $i < count($streets); $i++) {
            $street = $streets[$i];
            $streetName = $street['properties']['FULLNAME'];
            if (is_null($streetName) || in_array($streetName, $ignore)) {
                continue;
            }

            $streetGeo = geoPHP::load(json_encode($street), 'json');
            $distance = $location->distance($streetGeo);

            if ($i == 0) {
                $shortestDistance = $distance;
                continue;
            }

            if ($distance < $shortestDistance) {
                if ($intersectsWith ? $streetGeo->intersects($intersectsWith) : true) {
                    $shortestDistance = $distance;
                    $index = $i;
                }
            }
        }

        return $streets[$index];
    }

    public function getLocationDetails($lng, $lat)
    {
        foreach ($this->boroughs as $borough) {
            if (!$this->isInBorough($lng, $lat, $borough)) {
                continue;
            }

            $hood = $this->getNeighborhood($lng, $lat, $borough);
            $street1 = $this->getClosestStreet($lng, $lat, $borough);
            $streetName1 = $street1['properties']['FULLNAME'];
            $geometry1 = $street1['geometry'];
            $streetGeo = geoPHP::load(json_encode($geometry1), 'json');

            $ignore = [
                $streetName1
            ];
            $street2 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
            // $street2Geo = geoPHP::load(json_encode($street2), 'json');
            $streetName2 = $street2['properties']['FULLNAME'];

            $ignore[] = $streetName2;
            $opposite1 = $this->getOppositeStreet($streetName1);
            if ($opposite1) {
                $ignore[] = $opposite1;
            }

            $opposite2 = $this->getOppositeStreet($streetName2);
            if ($opposite2) {
                $ignore[] = $opposite2;
            }

            $street3 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
            $streetName3 = $street3['properties']['FULLNAME'];

            return [
                'borough' => $borough,
                'hood' => $hood,
                'streets' => [
                    $streetName1,
                    $streetName2,
                    $streetName3
                ]
            ];
        }

        return false;
    }

    public static function removeDuplicateStreets($borough = 'manhattan')
    {
        $streets = File::json(resource_path('geoJSON/boroughs/streets/' . $borough . '.geojson'));
        $newFile = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
        for ($i = 0; $i < count($streets['features']); $i++) {
            $item = $streets['features'][$i];
            $props = $item['properties'];
            $name = $props['FULLNAME'];
            $parsedName = NewYorkCity::parseStreetName($name);
            $coords = $item['geometry']['coordinates'];

            // Search the newly constructed array for duplicate values
            $index = $this->searchFeatures($newFile['features'], $parsedName, $coords);
            if (!$index) {
                $item['properties']['FULLNAME'] = $parsedName;
                $newFile['features'][] = $item;
            }
        }
        return json_encode($newFile);
    }

    public static function cleanUpData($boroughNum)
    {
        $boros = File::json(resource_path('geoJSON/nyc-boroughs.geojson'));
        $streets = File::json(resource_path('geoJSON/nyc-streets.geojson'));
        $newFile = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
        $boroGeo = geoPHP::load(json_encode($boros['features'][$boroughNum]), 'json'); // 0 = staten, 1 = queens, 2 = brooklyn, 3 = manhattan, 4 = bronx 

        for ($i = 0; $i < count($streets['features']); $i++) {
            $item = $streets['features'][$i];
            $streetGeo = geoPHP::load(json_encode($item), 'json');
            if ($streetGeo->within($boroGeo)) {
                $newFile['features'][] = $item;
            }
        }
        return json_encode($newFile);
    }

    private function searchFeatures($features, $streetName, $coords)
    {
        for ($i = 0; $i < count($features); $i++) {
            $item = $features[$i];
            $props = $item['properties'];
            $name = $props['FULLNAME'];
            $parsedName = NewYorkCity::parseStreetName($name);
            $coords1 = $item['geometry']['coordinates'];
            $coordsEqual = $this->compareCoords($coords, $coords1);
            if ($parsedName == $streetName && $coordsEqual) {
                return $i;
            }
        }
        return false;
    }

    public static function parseStreetName($name)
    {
        if (!Str::contains($name, ' ')) {
            return $name;
        }

        $exp = explode(' ', $name);
        $count = count($exp);
        $word = $exp[$count - 2];
        if (!is_numeric($word)) {
            return $name;
        }

        $exp[$count - 2] = Number::ordinal($word);
        return join(" ", $exp);
    }

    private function getOppositeStreet($street)
    {
        if (Str::startsWith($street, ['W ', 'E '])) {
            return (Str::charAt($street, 0) == 'W' ? 'E' : 'W') . substr($street, 1);
        }
        return false;
    }

    private function locationToObject($type = 'Point', $lng = -73.926186, $lat = 40.829659)
    {
        return geoPHP::load(json_encode([
            'type' => $type,
            'coordinates' => [$lng, $lat] // lng and lat format.
        ]), 'json');
    }

    private function compareCoords($coords1, $coords2)
    {
        $count = count($coords1);
        if ($count !== count($coords2)) {
            return false;
        }
        for ($i = 0; $i < $count; $i++) {
            if ($coords1[$i][0] != $coords2[$i][0] || $coords1[$i][1] != $coords2[$i][1]) {
                return false;
            }
        }
        return true;
    }

    private function getStreetById($id)
    {
        $allStreets = File::json(resource_path('geoJSON/nyc-streets.geojson'));
        $features = $allStreets['features'];
        for ($i = 0; $i < count($features); $i++) {
            if ($features[$i]['properties']['LINEARID'] == $id) {
                return $features[$i];
            }
        }
        return false;
    }

    public function getLocationByDistance($dx, $dy, $lat, $lng)
    {
        $rEarth = 6378; // in kilometers
        $newLat  = $lat  + ($dy / $rEarth) * (180 / pi());
        $newLng = $lng + ($dx / $rEarth) * (180 / pi()) / cos($lat * pi() / 180);
        return [
            $newLat,
            $newLng
        ];
    }
}
