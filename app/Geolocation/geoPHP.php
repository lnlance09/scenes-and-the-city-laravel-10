<?php

namespace App\Geolocation;

use Exception;

// Adapters
include_once(__DIR__ . '/Adapters/GeoAdapter.php');
include_once(__DIR__ . '/Adapters/GeoJSON.php');
include_once(__DIR__ . '/Adapters/WKT.php');
include_once(__DIR__ . '/Adapters/EWKT.php');
include_once(__DIR__ . '/Adapters/WKB.php');

// Geometries
include_once(__DIR__ . '/Geometry/Geometry.php');
include_once(__DIR__ . '/Geometry/Point.php');
include_once(__DIR__ . '/Geometry/Collection.php');
include_once(__DIR__ . '/Geometry/LineString.php');
include_once(__DIR__ . '/Geometry/MultiPoint.php');
include_once(__DIR__ . '/Geometry/Polygon.php');
include_once(__DIR__ . '/Geometry/MultiLineString.php');
include_once(__DIR__ . '/Geometry/MultiPolygon.php');
include_once(__DIR__ . '/Geometry/GeometryCollection.php');

class geoPHP
{
	static function getAdapterMap()
	{
		return [
			'wkt' => 'WKT',
			'ewkt' => 'EWKT',
			'wkb' => 'WKB',
			'json' => 'GeoJSON',
			'geojson' => 'GeoJSON'
		];
	}

	static function geometryList()
	{
		return [
			'point' => 'Point',
			'linestring' => 'LineString',
			'polygon' => 'Polygon',
			'multipoint' => 'MultiPoint',
			'multilinestring' => 'MultiLineString',
			'multipolygon' => 'MultiPolygon',
			'geometrycollection' => 'GeometryCollection',
		];
	}

	static function load()
	{
		$args = func_get_args();
		$data = array_shift($args);
		$type = array_shift($args);
		$typeMap = geoPHP::getAdapterMap();

		if (!$type) {
			if (is_object($data)) {
				if ($data instanceof Geometry) {
					return $data;
				}
			}

			$detected = geoPHP::detectFormat($data);
			if (!$detected) {
				return false;
			}

			$format = explode(':', $detected);
			$type = array_shift($format);
			$args = $format;
		}

		$processorType = $typeMap[$type];
		if (!$processorType) {
			throw new Exception('geoPHP could not find an adapter of type ' . htmlentities($type));
		}

		$processor = new $processorType();
		if (!is_array($data)) {
			$result = call_user_func_array([$processor, 'read'], array_merge([$data], $args));
		} else {
			$geoms = [];
			foreach ($data as $item) {
				$geoms[] = call_user_func_array([$processor, 'read'], array_merge([$item], $args));
			}
			$result = geoPHP::geometryReduce($geoms);
		}
		return $result;
	}

	static function geosInstalled($force = null)
	{
		static $geosInstalled = null;
		if ($force !== null) {
			$geosInstalled = $force;
		}
		if ($geosInstalled !== null) {
			return $geosInstalled;
		}
		$geosInstalled = class_exists('GEOSGeometry');
		return $geosInstalled;
	}

	static function geosToGeometry($geos)
	{
		if (!geoPHP::geosInstalled()) {
			return null;
		}
		$wkbWriter = new GEOSWKBWriter();
		$wkb = $wkbWriter->writeHEX($geos);
		$geometry = geoPHP::load($wkb, 'wkb', true);
		if ($geometry) {
			$geometry->setGeos($geos);
			return $geometry;
		}
	}

	// Reduce a geometry, or an array of geometries, into their 'lowest' available common geometry.
	// For example a GeometryCollection of only points will become a MultiPoint
	// A multi-point containing a single point will return a point.
	// An array of geometries can be passed and they will be compiled into a single geometry
	static function geometryReduce($geometry)
	{
		// If it's an array of one, then just parse the one
		if (is_array($geometry)) {
			if (empty($geometry)) {
				return false;
			}
			if (count($geometry) == 1) {
				return geoPHP::geometryReduce(array_shift($geometry));
			}
		}

		// If the geometry cannot even theoretically be reduced more, then pass it back
		if (gettype($geometry) == 'object') {
			$passbacks = ['Point', 'LineString', 'Polygon'];
			if (in_array($geometry->geometryType(), $passbacks)) {
				return $geometry;
			}
		}

		// If it is a mutlti-geometry, check to see if it just has one member
		// If it does, then pass the member, if not, then just pass back the geometry
		if (gettype($geometry) == 'object') {
			if (in_array(get_class($geometry), $passbacks)) {
				$components = $geometry->getComponents();
				if (count($components) == 1) {
					return $components[0];
				}
				return $geometry;
			}
		}

		// So now we either have an array of geometries, a GeometryCollection, or an array of GeometryCollections
		if (!is_array($geometry)) {
			$geometry = [$geometry];
		}

		$geometries = [];
		$geomTypes = [];
		$collections = ['MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];

		foreach ($geometry as $item) {
			if ($item) {
				if (in_array(get_class($item), $collections)) {
					foreach ($item->getComponents() as $component) {
						$geometries[] = $component;
						$geomTypes[] = $component->geometryType();
					}
				} else {
					$geometries[] = $item;
					$geomTypes[] = $item->geometryType();
				}
			}
		}

		$geomTypes = array_unique($geomTypes);
		if (empty($geomTypes)) {
			return false;
		}

		if (count($geomTypes) == 1) {
			if (count($geometries) == 1) {
				return $geometries[0];
			}
			$class = 'Multi' . $geomTypes[0];
			return new $class($geometries);
		}

		return new GeometryCollection($geometries);
	}

	static function detectFormat(&$input)
	{
		$mem = fopen('php://memory', 'r+');
		fwrite($mem, $input, 11); // Write 11 bytes - we can detect the vast majority of formats in the first 11 bytes
		fseek($mem, 0);

		$bytes = unpack('c*', fread($mem, 11));
		if (empty($bytes)) {
			return false;
		}

		// First char is a tab, space or carriage-return. trim it and try again
		if ($bytes[1] == 9 || $bytes[1] == 10 || $bytes[1] == 32) {
			return geoPHP::detectFormat(ltrim($input));
		}

		// Detect WKB or EWKB -- first byte is 1 (little endian indicator)
		if ($bytes[1] == 1) {
			// If SRID byte is TRUE (1), it's EWKB
			return $bytes[5] ? 'ewkb' : 'wkb';
		}

		// Detect HEX encoded WKB or EWKB (PostGIS format) -- first byte is 48, second byte is 49 (hex '01' => first-byte = 1)
		if ($bytes[1] == 48 && $bytes[2] == 49) {
			// The shortest possible WKB string (LINESTRING EMPTY) is 18 hex-chars (9 encoded bytes) long
			// This differentiates it from a geohash, which is always shorter than 18 characters.
			if (strlen($input) >= 18) {
				// @@TODO: Differentiate between EWKB and WKB -- check hex-char 10 or 11 (SRID bool indicator at encoded byte 5)
				return 'ewkb:1';
			}
		}

		// Detect GeoJSON - first char starts with {
		if ($bytes[1] == 123) {
			return 'json';
		}

		// Detect EWKT - first char is S
		if ($bytes[1] == 83) {
			return 'ewkt';
		}

		// Detect WKT - first char starts with P (80), L (76), M (77), or G (71)
		$wkt_chars = [80, 76, 77, 71];
		if (in_array($bytes[1], $wkt_chars)) {
			return 'wkt';
		}

		// Detect XML -- first char is <
		if ($bytes[1] == 60) {
			$string = substr($input, 0, 256);
			if (strpos($string, '<kml') !== false) {
				return 'kml';
			}
			if (strpos($string, '<coordinate') !== false) {
				return 'kml';
			}
			if (strpos($string, '<gpx') !== false) {
				return 'gpx';
			}
			if (strpos($string, '<georss') !== false) {
				return 'georss';
			}
			if (strpos($string, '<rss') !== false) {
				return 'georss';
			}
			if (strpos($string, '<feed') !== false) {
				return 'georss';
			}
		}

		// We need an 8 byte string for geohash and unpacked WKB / WKT
		fseek($mem, 0);
		$string = trim(fread($mem, 8));

		// Detect geohash - geohash ONLY contains lowercase chars and numerics
		preg_match('/[a-z0-9]+/', $string, $matches);
		if ($matches[0] == $string) {
			return 'geohash';
		}

		return false;
	}
}
