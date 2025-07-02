<?php

use App\Geolocation\Adapters;
use App\Geolocation\geoPHP;

/**
 * GeoJSON class : a geojson reader/writer.
 *
 * Note that it will always return a GeoJSON geometry. This
 * means that if you pass it a feature, it will return the
 * geometry of that feature strip everything else.
 */
class GeoJSON extends GeoAdapter
{
	/**
	 * Given an object or a string, return a Geometry
	 *
	 * @param mixed $input The GeoJSON string or object
	 *
	 * @return object Geometry
	 */
	public function read($input)
	{
		if (is_string($input)) {
			$input = json_decode($input);
		}
		if (!is_object($input)) {
			throw new Exception('Invalid JSON');
		}
		if (!is_string($input->type)) {
			throw new Exception('Invalid JSON');
		}

		if ($input->type == 'FeatureCollection') {
			$geoms = [];
			foreach ($input->features as $feature) {
				$geoms[] = $this->read($feature);
			}
			return geoPHP::geometryReduce($geoms);
		}

		if ($input->type == 'Feature') {
			return $this->read($input->geometry);
		}

		return $this->objToGeom($input);
	}

	private function objToGeom($obj)
	{
		$type = $obj->type;
		if ($type == 'GeometryCollection') {
			return $this->objToGeometryCollection($obj);
		}
		$method = 'arrayTo' . $type;
		return $this->$method($obj->coordinates);
	}

	private function arrayToPoint($array)
	{
		if (!empty($array)) {
			return new Point($array[0], $array[1]);
		}
		return new Point();
	}

	private function arrayToLineString($array)
	{
		$points = [];
		foreach ($array as $compArray) {
			$points[] = $this->arrayToPoint($compArray);
		}
		return new LineString($points);
	}

	private function arrayToPolygon($array)
	{
		$lines = [];
		foreach ($array as $compArray) {
			$lines[] = $this->arrayToLineString($compArray);
		}
		return new Polygon($lines);
	}

	private function arrayToMultiPoint($array)
	{
		$points = [];
		foreach ($array as $compArray) {
			$points[] = $this->arrayToPoint($compArray);
		}
		return new MultiPoint($points);
	}

	private function arrayToMultiLineString($array)
	{
		$lines = [];
		foreach ($array as $compArray) {
			$lines[] = $this->arrayToLineString($compArray);
		}
		return new MultiLineString($lines);
	}

	private function arrayToMultiPolygon($array)
	{
		$polys = [];
		foreach ($array as $compArray) {
			$polys[] = $this->arrayToPolygon($compArray);
		}
		return new MultiPolygon($polys);
	}

	private function objToGeometryCollection($obj)
	{
		$geoms = [];
		if (empty($obj->geometries)) {
			throw new Exception('Invalid GeoJSON: GeometryCollection with no component geometries');
		}
		foreach ($obj->geometries as $compObject) {
			$geoms[] = $this->objToGeom($compObject);
		}
		return new GeometryCollection($geoms);
	}

	/**
	 * Serializes an object into a geojson string
	 *
	 *
	 * @param Geometry $obj The object to serialize
	 *
	 * @return string The GeoJSON string
	 */
	public function write(Geometry $geometry, $returnArray = false)
	{
		if ($returnArray) {
			return $this->getArray($geometry);
		}
		return json_encode($this->getArray($geometry));
	}

	public function getArray($geometry)
	{
		if ($geometry->getGeomType() == 'GeometryCollection') {
			$componentArray = [];
			foreach ($geometry->components as $component) {
				$componentArray[] = [
					'type' => $component->geometryType(),
					'coordinates' => $component->asArray(),
				];
			}
			return [
				'type' => 'GeometryCollection',
				'geometries' => $componentArray,
			];
		}

		return [
			'type' => $geometry->getGeomType(),
			'coordinates' => $geometry->asArray(),
		];
	}
}
