<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Number;
use Illuminate\Support\Str;
use Brick\Geo\Engine\GeosEngine;
use Brick\Geo\Point;
use Brick\Geo\Io\GeoJsonReader;

class NewYorkCity extends Model
{
    public $boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx'];
    public $parks = [];
    public $bridges = [];
    public $tunnels = [];
    public $buildings = [];
    public $subwayStops = [];
    public $subwayLines = [];
    public $neighborhoods = [];
    public $avenues = [];
    public $streets = [];

    public $reader;
    public $geosEngine;

    function __construct()
    {
        $this->reader = new GeoJsonReader();
        $this->geosEngine = new GeosEngine();
    }


    public function isInBorough($lng, $lat, $borough = 'manhattan')
    {
        $json = File::json(resource_path('geoJSON/nyc-boroughs.geojson'));
        $key = array_search($borough, $this->boroughs);
        $location = Point::xy($lng, $lat);
        $polygon = $this->reader->read(json_encode($json['features'][$key]['geometry']));
        return $this->geosEngine->contains($polygon, $location);
    }

    public function getNeighborhood($lng, $lat, $borough)
    {
        $json = File::json(resource_path('geoJSON/boroughs/' . $borough . '.geojson'));
        $hoods = $json['features'];
        $location = Point::xy($lng, $lat);
        foreach ($hoods as $hood) {
            $area = $this->reader->read(json_encode($hood['geometry']));
            if ($this->geosEngine->contains($area, $location)) {
                return $hood['properties']['name'];
            }
        }
        return false;
    }

    public function getClosestStreet($lng, $lat, $borough, $ignore = [], $intersectsWith = null)
    {
        if ($borough === 'bridges') {
            $file = File::json(resource_path('./geoJSON/nyc-bridges-and-tunnels.json'));
        } else {
            $file = File::json(resource_path('./geoJSON/boroughs/streets/' . $borough . '.geojson'));
        }

        $location = Point::xy($lng, $lat);
        $streets = $file['features'];
        $shortestDistance = 0;
        $index = 0;

        for ($i = 0; $i < count($streets); $i++) {
            $street = $streets[$i];
            $streetName = $street['properties']['FULLNAME'];
            if (is_null($streetName) || in_array($streetName, $ignore)) {
                continue;
            }

            $streetGeo = $this->reader->read(json_encode($street['geometry']));
            $distance = $this->geosEngine->distance($streetGeo, $location);

            if ($i === 0) {
                $shortestDistance = $distance;
                continue;
            }

            if ($distance < $shortestDistance) {
                if ($intersectsWith ? $this->geosEngine->intersects($streetGeo, $intersectsWith) : true) {
                    $shortestDistance = $distance;
                    $index = $i;
                }
            }
        }

        return $streets[$index];
    }

    /**
     * 
     */
    private function findClosestPoint($coords, $lat, $lng)
    {
        $location1 = Point::xy($lng, $lat);
        $shortestDistance = 0;
        $index = 0;
        for ($i = 0; $i < count($coords); $i++) {
            $item = $coords[$i];
            $location2 = Point::xy($item[1], $item[0]);
            $distance = $this->geosEngine->distance($location1, $location2);
            if ($i === 0) {
                $shortestDistance = $distance;
                continue;
            }
            if ($distance < $shortestDistance) {
                $shortestDistance = $distance;
                $index = $i;
            }
        }
        return $coords[$index];
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
            $streetGeo = $this->reader->read(json_encode($geometry1));

            // Get the 2nd closest street
            $ignore = [
                $streetName1
            ];
            $street2 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
            $streetName2 = $street2['properties']['FULLNAME'];

            // Add the 2nd closest street to the ignore group
            $ignore[] = $streetName2;
            // Get the opposite of both streets and exclude them
            // For example, if east 53rd street is one of the two closest streets, west 53rd should not be included
            $opposite1 = $this->getOppositeStreet($streetName1);
            if ($opposite1) {
                $ignore[] = $opposite1;
            }
            $opposite2 = $this->getOppositeStreet($streetName2);
            if ($opposite2) {
                $ignore[] = $opposite2;
            }

            // Street number 3
            $street3 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
            $streetName3 = $street3['properties']['FULLNAME'];

            $streetNum = $this->getStreetNumber($streetName1);
            $hasNumber = $streetName1 != $streetNum;

            // Since broadway curves, we have to ignore it in the mid 50's range
            if (
                $borough === 'manhattan' &&
                ($streetName3 === 'Broadway') &&
                $hasNumber && $streetNum > 49 && $streetNum < 60
            ) {
                $closest2 = $this->findClosestPoint($street2['geometry']['coordinates'], $lat, $lng);
                $closest3 = $this->findClosestPoint($street3['geometry']['coordinates'], $lat, $lng);
                $x2 = Point::xy($closest2[0], $closest2[1])->x();
                $x3 = Point::xy($closest3[0], $closest3[1])->x();

                if ($x3 > $x2) {
                    $ignore[] = $streetName3;
                    $street3 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
                    $streetName3 = $street3['properties']['FULLNAME'];
                }
            }

            if (
                $borough === 'manhattan' &&
                $streetName2 === 'Broadway' &&
                ($streetName3 === 'Columbus Ave' || $streetName3 === 'Central Park W') &&
                $hasNumber && $streetNum > 60 && $streetNum < 69
            ) {
                $closest2 = $this->findClosestPoint($street2['geometry']['coordinates'], $lat, $lng);
                $closest3 = $this->findClosestPoint($street3['geometry']['coordinates'], $lat, $lng);
                $x2 = Point::xy($closest2[0], $closest2[1])->x();
                $x3 = Point::xy($closest3[0], $closest3[1])->x();

                $switch = ($closest3 === 'Columbus Ave' && $x3 < $x2) || ($closest3 === 'Central Park W' && $x3 > $x2);

                if ($switch) {
                    $ignore[] = $streetName3;
                    $street3 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
                    $streetName3 = $street3['properties']['FULLNAME'];
                }
            }

            if (
                $borough === 'manhattan' &&
                $streetName2 === 'Broadway' &&
                $streetName3 === '7th Ave' &&
                $hasNumber && $streetNum > 40 && $streetNum < 50
            ) {
                $ignore[] = $streetName2;
                $street2 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
                $streetName2 = $street2['properties']['FULLNAME'];

                $ignore[] = $streetName2;
                $street3 = $this->getClosestStreet($lng, $lat, $borough, $ignore, $streetGeo);
                $streetName3 = $street3['properties']['FULLNAME'];
            }

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

        // If the location isn't in one of the boroughs, then search bridges and tunnels
        $street = $this->getClosestStreet($lng, $lat, 'bridges');
        $streetName = $street['properties']['FULLNAME'];
        return [
            'borough' => null,
            'hood' => null,
            'streets' => [
                $streetName
            ]
        ];
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

    private function getStreetNumber($name)
    {
        $exp = explode(' ', $name);
        if (count($exp) === 1) {
            return $name;
        }
        return (int) preg_replace('/(st|nd|rd|th)$/', '', $exp[1]);
    }

    private function getOppositeStreet($street)
    {
        if (Str::startsWith($street, ['W ', 'E '])) {
            return (Str::charAt($street, 0) == 'W' ? 'E' : 'W') . substr($street, 1);
        }
        return false;
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

    public function getStreetById($id)
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
            $index = NewYorkCity::searchFeatures($newFile['features'], $parsedName, $coords);
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
        $boroGeo = $this->reader->read(json_encode($boros['features'][$boroughNum]));
        for ($i = 0; $i < count($streets['features']); $i++) {
            $item = $streets['features'][$i];
            $streetGeo = $this->reader->read(json_encode($item));
            if ($this->geosEngine->within($streetGeo, $boroGeo)) {
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
}
