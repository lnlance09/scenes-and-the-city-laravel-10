<?php

namespace App\Models;

use App\Geolocation\geoPHP;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

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

    public function removeDuplicateStreets($borough = 'manhattan')
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
            $parsedName = $this->parseStreetName($name);
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

    public function cleanUpData($boroughNum)
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
            $parsedName = $this->parseStreetName($name);
            $coords1 = $item['geometry']['coordinates'];
            $coordsEqual = $this->compareCoords($coords, $coords1);
            if ($parsedName == $streetName && $coordsEqual) {
                return $i;
            }
        }
        return false;
    }

    // possibly move to a helper class?
    private function parseStreetName($name)
    {
        $exp = explode(" ", $name);
        $count = count($exp);
        if ($count == 1) {
            return $name;
        }

        $endings = ["st", "nd", "rd", "th"];
        $word = $exp[$count - 2];
        $newWord = $word;

        foreach ($endings as $ending) {
            $endingExp = explode($ending, $word);
            if (count($endingExp) > 1) {
                continue;
            }
            if (!is_numeric($endingExp[0])) {
                continue;
            }

            $num = $endingExp[0];
            if ($num < 10 || $num > 20) {
                switch (substr($num, -1)) {
                    case 1:
                        $newWord = $num . "st";
                        break;
                    case 2:
                        $newWord = $num . "nd";
                        break;
                    case 3:
                        $newWord = $num . "rd";
                        break;
                    default:
                        $newWord = $num . "th";
                }
            } else {
                $newWord = $num . "th";
            }
        }

        $exp[$count - 2] = $newWord;
        return join(" ", $exp);
    }

    private function getOppositeStreet($street)
    {
        $firstChar = substr($street, 0, 2);
        if ($firstChar == 'W ' || $firstChar == 'E ') {
            return ($firstChar == 'W ' ? 'E ' : 'W ') . substr($street, 2);
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
        if (count($coords1) != count($coords2)) {
            return false;
        }
        for ($i = 0; $i < count($coords1); $i++) {
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

    public function prettyPrint($data)
    {
        echo '<pre>';
        echo print_r($data);
        echo '</pre>';
    }
}
