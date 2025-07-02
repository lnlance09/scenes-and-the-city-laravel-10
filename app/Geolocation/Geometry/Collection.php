<?php

/**
 * Collection: Abstract class for compound geometries
 *
 * A geometry is a collection if it is made up of other
 * component geometries. Therefore everything but a Point
 * is a Collection. For example a LingString is a collection
 * of Points. A Polygon is a collection of LineStrings etc.
 */
abstract class Collection extends Geometry
{
	public $components = [];

	/**
	 * Constructor: Checks and sets component geometries
	 *
	 * @param array $components array of geometries
	 */
	public function __construct($components = [])
	{
		if (!is_array($components)) {
			throw new Exception('Component geometries must be passed as an array');
		}
		foreach ($components as $component) {
			if ($component instanceof Geometry) {
				$this->components[] = $component;
			} else {
				throw new Exception('Cannot create a collection with non-geometries');
			}
		}
	}

	/**
	 * Returns Collection component geometries
	 *
	 * @return array
	 */
	public function getComponents()
	{
		return $this->components;
	}

	public function invertxy()
	{
		for ($i = 0; $i < count($this->components); $i++) {
			if (method_exists($this->components[$i], 'invertxy')) {
				$this->components[$i]->invertxy();
			}
		}
	}

	public function centroid()
	{
		if ($this->isEmpty()) {
			return null;
		}

		if ($this->geos()) {
			$geos_centroid = $this->geos()->centroid();
			if ($geos_centroid->typeName() == 'Point') {
				return geoPHP::geosToGeometry($this->geos()->centroid());
			}
		}

		return $this->envelope()->centroid();
	}

	public function getBBox()
	{
		if ($this->isEmpty()) {
			return null;
		}

		if ($this->geos()) {
			$envelope = $this->geos()->envelope();
			if ($envelope->typeName() == 'Point') {
				return geoPHP::geosToGeometry($envelope)->getBBOX();
			}

			$geosRing = $envelope->exteriorRing();
			return [
				'maxy' => $geosRing->pointN(3)->getY(),
				'miny' => $geosRing->pointN(1)->getY(),
				'maxx' => $geosRing->pointN(1)->getX(),
				'minx' => $geosRing->pointN(3)->getX(),
			];
		}

		$i = 0;
		foreach ($this->components as $component) {
			$componentBbox = $component->getBBox();
			if ($i == 0) {
				$maxX = $componentBbox['maxx'];
				$maxY = $componentBbox['maxy'];
				$minX = $componentBbox['minx'];
				$minY = $componentBbox['miny'];
			}

			$maxX = $componentBbox['maxx'] > $maxX ? $componentBbox['maxx'] : $maxX;
			$maxY = $componentBbox['maxy'] > $maxY ? $componentBbox['maxy'] : $maxY;
			$minX = $componentBbox['minx'] < $minX ? $componentBbox['minx'] : $minX;
			$minY = $componentBbox['miny'] < $minY ? $componentBbox['miny'] : $minY;

			$i++;
		}

		return [
			'maxy' => $maxY,
			'miny' => $minY,
			'maxx' => $maxX,
			'minx' => $minX,
		];
	}

	public function asArray()
	{
		$array = [];
		foreach ($this->components as $component) {
			$array[] = $component->asArray();
		}
		return $array;
	}

	public function area()
	{
		if ($this->geos()) {
			return $this->geos()->area();
		}

		$area = 0;
		foreach ($this->components as $component) {
			$area += $component->area();
		}
		return $area;
	}

	// By default, the boundary of a collection is the boundary of it's components
	public function boundary()
	{
		if ($this->isEmpty()) {
			return new LineString();
		}

		if ($this->geos()) {
			return $this->geos()->boundary();
		}

		$componentsBoundaries = [];
		foreach ($this->components as $component) {
			$componentsBoundaries[] = $component->boundary();
		}
		return geoPHP::geometryReduce($componentsBoundaries);
	}

	public function numGeometries()
	{
		return count($this->components);
	}

	// Note that the standard is 1 based indexing
	public function geometryN($n)
	{
		$n = intval($n);
		if (array_key_exists($n - 1, $this->components)) {
			return $this->components[$n - 1];
		}
		return null;
	}

	public function length()
	{
		$length = 0;
		foreach ($this->components as $delta => $component) {
			$length += $component->length();
		}
		return $length;
	}

	public function greatCircleLength($radius = 6378137)
	{
		$length = 0;
		foreach ($this->components as $component) {
			$length += $component->greatCircleLength($radius);
		}
		return $length;
	}

	public function haversineLength()
	{
		$length = 0;
		foreach ($this->components as $component) {
			$length += $component->haversineLength();
		}
		return $length;
	}

	public function dimension()
	{
		$dimension = 0;
		foreach ($this->components as $component) {
			if ($component->dimension() > $dimension) {
				$dimension = $component->dimension();
			}
		}
		return $dimension;
	}

	// A collection is empty if it has no components OR all it's components are empty
	public function isEmpty()
	{
		if (!count($this->components)) {
			return true;
		}
		foreach ($this->components as $component) {
			if (!$component->isEmpty()) {
				return false;
			}
		}
		return true;
	}

	public function numPoints()
	{
		$num = 0;
		foreach ($this->components as $component) {
			$num += $component->numPoints();
		}
		return $num;
	}

	public function getPoints()
	{
		$points = [];
		foreach ($this->components as $component) {
			$points = array_merge($points, $component->getPoints());
		}
		return $points;
	}

	public function equals($geometry)
	{
		if ($this->geos()) {
			return $this->geos()->equals($geometry->geos());
		}

		// To test for equality we check to make sure that there is a matching point
		// in the other geometry for every point in this geometry.
		// This is slightly more strict than the standard, which
		// uses Within(A,B) = true and Within(B,A) = true
		// @@TODO: Eventually we could fix this by using some sort of simplification
		// method that strips redundant vertices (that are all in a row)

		$thisPoints = $this->getPoints();
		$otherPoints = $geometry->getPoints();

		// First do a check to make sure they have the same number of vertices
		if (count($thisPoints) != count($otherPoints)) {
			return false;
		}

		foreach ($thisPoints as $point) {
			$foundMatch = false;
			foreach ($otherPoints as $key => $testPoint) {
				if ($point->equals($testPoint)) {
					$foundMatch = true;
					unset($other_points[$key]);
					break;
				}
			}
			if (!$foundMatch) {
				return false;
			}
		}

		return true;
	}

	public function isSimple()
	{
		if ($this->geos()) {
			return $this->geos()->isSimple();
		}

		// A collection is simple if all it's components are simple
		foreach ($this->components as $component) {
			if (!$component->isSimple()) {
				return false;
			}
		}

		return true;
	}

	public function explode()
	{
		$parts = [];
		foreach ($this->components as $component) {
			$parts = array_merge($parts, $component->explode());
		}
		return $parts;
	}

	public function x()
	{
		return null;
	}
	public function y()
	{
		return null;
	}
	public function startPoint()
	{
		return null;
	}
	public function endPoint()
	{
		return null;
	}
	public function isRing()
	{
		return null;
	}
	public function isClosed()
	{
		return null;
	}
	public function pointN($n)
	{
		return null;
	}
	public function exteriorRing()
	{
		return null;
	}
	public function numInteriorRings()
	{
		return null;
	}
	public function interiorRingN($n)
	{
		return null;
	}
	public function pointOnSurface()
	{
		return null;
	}
}
