<?php

namespace App\Models;

use App\Geolocation\geoPHP;
use App\Geolocation\Geometry\Point;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

ini_set('memory_limit', '2048M');
ini_set('max_execution_time', 150);

class NewYorkCity extends Model
{
    public $boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten'];
    public $parks = [];
    public $bridges = [];
    public $tunnels = [];
    public $buildings = ['70 Pine', '20 Exchange', 'One World Trade Center', 'One Wall Street', '8 Spruce'];
    public $subwayStops = [];
    public $subwayLines = [];
    public $neighborhoods = [];
    public $avenues = [];
    public $streets = [];

    public $allStreets = [];
    public $geoData = [];
    public $geoStreets = [];

    function __construct()
    {
        $this->allStreets = File::json(resource_path('geoJSON/nyc-streets.geojson'));
        foreach ($this->boroughs as $borough) {
            $this->geoData[$borough] = File::json(resource_path('geoJSON/boroughs/' . $borough . '.geojson'));
            $this->geoStreets[$borough] = File::json(resource_path('geoJSON/boroughs/streets/' . $borough . '.geojson'));
        }
    }

    private function getFileName($fileName)
    {
        return strtolower(str_replace(' ', '-', $fileName));
    }

    private function locationToObject($type = 'Point', $lng = -73.926186, $lat = 40.829659)
    {
        return geoPHP::load(json_encode([
            'type' => $type,
            'coordinates' => [$lng, $lat] // lng and lat format.
        ]), 'json');
    }

    public function isInBorough($lng, $lat, $borough = 'manhattan')
    {
        $location = $this->locationToObject('Point', $lng, $lat);
        $borough = geoPHP::load(json_encode($this->geoData[$borough]), 'json');
        return $location->within($borough);
    }

    public function getNeighborhood($lng, $lat, $borough)
    {
        $neighborhoods = $this->geoData[$borough]['features'];
        $location = $this->locationToObject('Point', $lng, $lat);
        foreach ($neighborhoods as $hood) {
            $hoodArea = geoPHP::load(json_encode($hood['geometry']), 'json');
            if ($location->within($hoodArea)) {
                $hoodName = $hood['properties']['name'];
                return $hoodName;
            }
        }
        return false;
    }

    private function parseCoords($lat, $lng, $coords)
    {
        $shortestDistance = 0;
        $i = 0;
        $index = 0;
        foreach ($coords as $coord) {
            $distance = $this->haversine($lat, $lng, $coord[1], $coord[0]);
            if ($i == 0) {
                $shortestDistance = $distance;
            } else {
                if ($distance < $shortestDistance) {
                    $shortestDistance = $distance;
                    $index = $i;
                }
            }
        }

        return [
            'coords' => $coords[$index],
            'distance' => $distance
        ];
    }

    public function getClosestStreet($lng, $lat, $borough, $hood = null, $axis = "x", $ignore = [])
    {
        $file = File::json(resource_path('./geoJSON/boroughs/' . $borough . '-' . $axis . '.geojson'));
        if ($hood) {
            $file = File::json(resource_path('./geoJSON/neighborhoods/' . $borough . '/' . $this->getFileName($hood) . '.geojson'));
        }

        $shortestDistance = 0;
        $shortestName = "";
        $index = 0;
        $location = $this->locationToObject('Point', $lng, $lat);
        $streets = $file['features'];

        for ($i = 0; $i < count($streets); $i++) {
            $street = $streets[$i];
            $streetName = $street['properties']['FULLNAME'];
            if (in_array($streetName, $ignore) || is_null($streetName)) {
                continue;
            }

            /*
            $distance1 = $location->distance(geoPHP::load(json_encode($street['geometry']), 'json'));
            if ($i != count($streets) - 1) {
                $distance2 = $location->distance(geoPHP::load(json_encode($streets[$i + 1]['geometry']), 'json'));
                if ($distance1 < $distance2) {
                    $nextItem = $streets[$i + 1];
                    $streets[$i + 1] = $street;
                    $streets[$i] = $nextItem;
                }
            }
            */

            $distance = $this->parseCoords($lat, $lng, $street['geometry']['coordinates']);
            if ($i == 0) {
                $shortestDistance = $distance['distance'];
                $shortestName = $streetName;
            } else {
                if ($distance['distance'] < $shortestDistance) {
                    $shortestName = $streetName;
                    $shortestDistance = $distance['distance'];
                    $index = $i;
                }
            }
        }
        /*
        echo '<pre>';
        echo print_r($streets);
        echo '</pre>';
        die;
        */

        return [
            'streets' => array_slice($streets, -5),
            'name' => $shortestName,
            'distance' => $shortestDistance,
            'geometry' => $streets[$index]['geometry']
        ];
    }

    public function getLocationDetails($lng, $lat)
    {
        $origin = $this->locationToObject('Point', $lng, $lat);
        $store = [];

        foreach ($this->boroughs as $borough) {
            if (!$this->isInBorough($lng, $lat, $borough)) {
                continue;
            }

            $hood = $this->getNeighborhood($lng, $lat, $borough);

            $streetX = $this->getClosestStreet($lng, $lat, $borough, null, 'x');
            $streetNameX = $streetX['name'];
            $geometryX = $streetX['geometry'];
            $coordsX = $geometryX['coordinates'];

            $streetY = $this->getClosestStreet($lng, $lat, $borough, null, 'y');
            $streetNameY = $streetY['name'];
            $geometryY = $streetY['geometry'];
            $coordsY = $geometryY['coordinates'];

            echo "Street X: " . $streetNameX . ", Streeet Y: " . $streetNameY . " \n";

            $streetGeo = geoPHP::load(json_encode($geometryX), 'json');
            $streetStart = $streetGeo->startPoint();
            $streetEnd = $streetGeo->endPoint();
            $bearing = $this->calculateBearing(
                $streetStart->coords[0],
                $streetStart->coords[1],
                $streetEnd->coords[0],
                $streetEnd->coords[1]
            );

            $streets = File::json(resource_path('./geoJSON/boroughs/streets/' . $borough . '.geojson'));
            foreach ($coordsX as $coord) {
                for ($i = 0; $i < count($streets['features']); $i++) {
                    $road = $streets['features'][$i];
                    $geo = $road['geometry'];
                    $type = $geo['type'];
                    $name = $road['properties']['FULLNAME'];
                    $coordinates = $geo['coordinates'];

                    $namesDifferent = $this->parseStreetName($name) != $this->parseStreetName($streetNameX);
                    if (!$namesDifferent) {
                        continue;
                    }

                    if ($type == 'LineString') {
                        foreach ($coordinates as $c) {
                            $latsEqual = $c[0] === $coord[0];
                            $lngsEqual = $c[1] === $coord[1];
                            if ($latsEqual && $lngsEqual) {
                                $store[] = $road;
                            }
                        }
                    }

                    if ($type == 'MultiLineString') {
                        foreach ($coordinates as $c) {
                            foreach ($c as $b) {
                                $latsEqual = $b[0] === $coordsX[0];
                                $lngsEqual = $b[1] === $coordsX[1];
                                if ($latsEqual && $lngsEqual) {
                                    $store[] = $road;
                                }
                            }
                        }
                    }
                }
            }

            for ($i = 0; $i < count($store); $i++) {
                $intStreet1 = geoPHP::load(json_encode($store[$i]['geometry']), 'json');
                $distance1 = $intStreet1->distance($origin);

                if ($i != count($store) - 1) {
                    $intStreet2 = geoPHP::load(json_encode($store[$i + 1]['geometry']), 'json');
                    $distance2 = $intStreet2->distance($origin);

                    if ($distance1 < $distance2) {
                        $nextItem = $store[$i + 1];
                        $store[$i + 1] = $store[$i];
                        $store[$i] = $nextItem;
                    }
                }

                /*
                // echo "Street name: " . $store[$i]['properties']['FULLNAME'], " " . $distance . "<br />";
                if ($shortestDistance == null) {
                    $shortestDistance = $distance;
                }
                // echo abs($intBearing - $bearing) . "<br/>";
                if ($distance < $shortestDistance && abs($intBearing - $bearing) > 100) {
                    $shortestDistance = $distance;
                    $index = $i;
                }
                */
            }

            $core = [];
            for ($i = 0; $i < count($store); $i++) {
                $intStreet1 = geoPHP::load(json_encode($store[$i]['geometry']), 'json');
                $intStreetStart = $intStreet1->startPoint();
                $intStreetEnd = $intStreet1->endPoint();
                $intBearing = $this->calculateBearing(
                    $intStreetStart->coords[0],
                    $intStreetStart->coords[1],
                    $intStreetEnd->coords[0],
                    $intStreetEnd->coords[1]
                );
                if (abs($intBearing - $bearing) > 100) {
                    $core[] = $store[$i];
                }
            }

            return [
                'borough' => $borough,
                'hood' => $hood,
                'street' => $streetY,
                'core' => $core
            ];
        }

        return false;
    }

    public function deleteDuplicates()
    {
        $final = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
        $finalNames = [];
        $boroughStreets = $this->geoStreets['manhattan'];
        for ($i = 0; $i < count($boroughStreets['features']); $i++) {
            $item = $boroughStreets['features'][$i];
            $props = $item['properties'];
            $name = $props['FULLNAME'];
            $parsedName = $this->parseStreetName($name);

            if ($parsedName != $name ? !in_array($parsedName, $finalNames) : true) {
                $item['properties']['FULLNAME'] = $this->parseStreetName($name);
                $final['features'][] = $item;
                $finalNames[] = $parsedName;
            }
        }

        // return $final;
        return json_encode($final);
    }

    private function haversine(
        $lat1,
        $lon1,
        $lat2,
        $lon2
    ) {
        $dLat = ($lat2 - $lat1) *
            M_PI / 180.0;
        $dLon = ($lon2 - $lon1) *
            M_PI / 180.0;

        $lat1 = ($lat1) * M_PI / 180.0;
        $lat2 = ($lat2) * M_PI / 180.0;

        // apply formulae
        $a = pow(sin($dLat / 2), 2) +
            pow(sin($dLon / 2), 2) *
            cos($lat1) * cos($lat2);
        $rad = 6371;
        $c = 2 * asin(sqrt($a));
        return $rad * $c;
    }

    public function filterStreetsByDirection()
    {
        $xArray = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
        $xArrayNames = [];

        $yArray = [
            'type' => 'FeatureCollection',
            'features' => []
        ];
        $yArrayNames = [];
        $boroughStreets = $this->geoStreets['manhattan'];
        for ($i = 0; $i < count($boroughStreets['features']); $i++) {
            $item = $boroughStreets['features'][$i];
            $props = $item['properties'];
            $name = $props['FULLNAME'];

            $streetGeo = geoPHP::load(json_encode($item['geometry']), 'json');
            $streetStart = $streetGeo->startPoint();
            $streetEnd = $streetGeo->endPoint();
            // var_dump($streetGeo);
            if (is_null($streetStart) || is_null($streetEnd)) {
                continue;
            }

            $bearing = $this->calculateBearing(
                $streetStart->coords[0],
                $streetStart->coords[1],
                $streetEnd->coords[0],
                $streetEnd->coords[1]
            );

            $parsedName = $this->parseStreetName($name);
            $item['properties']['FULLNAME'] = $parsedName;

            if (!in_array($parsedName, $xArrayNames) && $bearing == 1) {
                $xArray['features'][] = $item;
                $xArrayNames[] = $this->parseStreetName($name);
            }

            if (!in_array($parsedName, $yArrayNames) && $bearing == 0) {
                $yArray['features'][] = $item;
                $yArrayNames[] = $this->parseStreetName($name);
            }
        }

        return json_encode($yArray);
        return [
            json_encode($xArray),
            json_encode($yArray)
        ];
    }

    private function calculateBearing($lat1, $lon1, $lat2, $lon2)
    {
        $lat1 = $lat1;
        $lon1 = $lon1;
        $lat2 = $lat2;
        $lon2 = $lon2;

        $dLon = abs($lon2 - $lon1);
        $dLat = abs($lat2 - $lat1);
        // echo "Lat delta: " . $dLat . "<br />";
        // echo "Lon delta: " . $dLon . "<br />";
        if ($dLat > ($dLon / 1.2)) {
            return 1;
        }

        return 0;

        $y = sin($dLon) * cos($lat2);
        $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLon);
        $bearingRadians = atan2($y, $x);
        $bearingDegrees = rad2deg($bearingRadians);
        return ($bearingDegrees + 360) % 360;
    }

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

    public function getIntersections($borough)
    {
        $newStreets = [];
        $comps = $this->geoStreets[$borough]['features'];
        foreach ($comps as $comp) {
            $compArea = geoPHP::load(json_encode($comp['geometry']), 'json');
            $compName = $comp['properties']['FULLNAME'];

            if (empty($compName)) {
                continue;
            }

            if (!array_key_exists($compName, $newStreets)) {
                $newStreets[$compName] = [
                    'geometry' => $comp['geometry'],
                    'intersections' => []
                ];
            }

            foreach ($comps as $otherComp) {
                $otherCompArea = geoPHP::load(json_encode($otherComp['geometry']), 'json');
                $otherCompName = $otherComp['properties']['FULLNAME'];

                if (empty($otherCompName)) {
                    continue;
                }

                if ($compName == $otherCompName) {
                    continue;
                }

                if (!array_key_exists($otherCompName, $newStreets)) {
                    $newStreets[$otherCompName] = [
                        'geometry' => $otherComp['geometry'],
                        'intersections' => []
                    ];
                }

                $intersects = $compArea->intersects($otherCompArea);
                if ($intersects) {
                    if (!in_array($otherCompName, $newStreets[$compName]['intersections'])) {
                        $newStreets[$compName]['intersections'][] = $otherCompName;
                        // sort($newStreets[$compName]['intersections']);
                    }
                    if (!in_array($compName, $newStreets[$otherCompName]['intersections'])) {
                        $newStreets[$otherCompName]['intersections'][] = $compName;
                        // sort($newStreets[$otherCompName]['intersections']);
                    }
                    // echo $compName . " intersects with " . $otherCompName . "<br />";
                } else {
                    // echo $comp['properties']['FULLNAME'] . " DOES NOT intersect with " . $otherComp['properties']['FULLNAME'] . "<br />";
                }
            }
        }

        ksort($newStreets);

        /*
        $keys = array_keys($newStreets);
        for ($i = 0; $i < count($newStreets); $i++) {
            $item = $newStreets[$keys[$i]];
            $area1 = geoPHP::load(json_encode($item['geometry']), 'json');

            for ($x = 0; $x < count($item['intersections']); $x++) {
                $intName = $item['intersections'][$x];
                $area2 = geoPHP::load(json_encode($newStreets[$intName]['geometry']), 'json');
                $distance = $area1->distance($area2);
                $newStreets[$keys[$i]]['intersections'][$x] = [$intName, $distance];
            }
        }
        */

        echo json_encode($newStreets);

        /*
        echo '<pre>';
        echo print_r($newStreets);
        echo '</pre>';
        */
    }

    public function cleanData()
    {
        $boros = File::json(resource_path('geoJSON/new-york-city-boroughs.geojson'));
        $json = File::json(resource_path('geoJSON/nyc-streets.geojson'));
        $newFile = [
            "type" => "FeatureCollection",
            "features" => []
        ];
        for ($i = 0; $i < count($json['features']); $i++) {
            $item = $json['features'][$i];
            $streetGeo = geoPHP::load(json_encode($item), 'json');
            $manhattan = geoPHP::load(json_encode($boros['features'][3]), 'json');
            if ($streetGeo->within($manhattan)) {
                $newFile['features'][] = $item;
            }
        }

        return $newFile;
    }

    private function getStreetById($id)
    {
        $features = $this->allStreets['features'];
        for ($i = 0; $i < count($features); $i++) {
            if ($features[$i]['properties']['LINEARID'] == $id) {
                return $features[$i];
            }
        }
        return false;
    }

    public function checkBorough($streetId, $borough = 'manhattan')
    {
        $street = $this->getStreetById($streetId);
        if (!$street) {
            return "Cannot find that street";
        }
        // $this->prettyPrint($street);
        $items = [
            'staten-island' => 0,
            'queens' => 1,
            'brooklyn' => 2,
            'manhattan' => 3,
            'bronx' => 4
        ];
        $index = $items[$borough];
        $boroArea = File::json(resource_path('geoJSON/manhattan-area.json'));
        $boros = File::json(resource_path('geoJSON/new-york-city-boroughs.geojson'));
        $streetGeo = geoPHP::load(json_encode($street), 'json');
        $boroGeo = geoPHP::load(json_encode($boros['features'][$index]), 'json');
        return $boroGeo->contains($streetGeo);
        // return $streetGeo->within($boroGeo);
    }

    public function prettyPrint($data)
    {
        echo '<pre>';
        echo print_r($data);
        echo '</pre>';
    }
}
