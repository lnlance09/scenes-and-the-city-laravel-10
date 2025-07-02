<?php

/**
 * WKT (Well Known Text) Adapter
 */
class WKT extends GeoAdapter
{

	/**
	 * Read WKT string into geometry objects
	 *
	 * @param string $WKT A WKT string
	 *
	 * @return Geometry
	 */
	public function read($wkt)
	{
		$wkt = trim($wkt);

		// If it contains a ';', then it contains additional SRID data
		if (strpos($wkt, ';')) {
			$parts = explode(';', $wkt);
			$wkt = $parts[1];
			$eparts = explode('=', $parts[0]);
			$srid = $eparts[1];
		} else {
			$srid = null;
		}

		// If geos is installed, then we take a shortcut and let it parse the WKT
		if (geoPHP::geosInstalled()) {
			$reader = new GEOSWKTReader();
			if ($srid) {
				$geom = geoPHP::geosToGeometry($reader->read($wkt));
				$geom->setSRID($srid);
				return $geom;
			}

			return geoPHP::geosToGeometry($reader->read($wkt));
		}
		$wkt = str_replace(', ', ',', $wkt);

		// For each geometry type, check to see if we have a match at the
		// beginning of the string. If we do, then parse using that type
		foreach (geoPHP::geometryList() as $geomType) {
			$wktGeom = strtoupper($geomType);
			if (strtoupper(substr($wkt, 0, strlen($wktGeom))) == $wktGeom) {
				$dataString = $this->getDataString($wkt);
				$method = 'parse' . $geomType;

				if ($srid) {
					$geom = $this->$method($dataString);
					$geom->setSRID($srid);
					return $geom;
				}

				return $this->$method($dataString);
			}
		}
	}

	private function validateDate($dataString, $type)
	{
		$dataString = $this->trimParens($dataString);
		if ($dataString == 'EMPTY') {
			switch ($type) {
				case 'POINT':
					return new Point();
				case 'LINE STRING':
					return new LineString();
				case 'POLYGON':
					return new Polygon();
				case 'MULTI POINT':
					return new MultiPoint();
				case 'MULTI LINE STRING':
					return new MultiLineString();
				case 'MULTI POLYGON':
					return new MultiPolygon();
				case 'GEOMETRY COLLECTION':
					return new GeometryCollection();
			}
		}
		return $dataString;
	}
	private function parsePoint($dataString)
	{
		$dataString = $this->validateDate($dataString, 'POINT');
		$parts = explode(' ', $dataString);
		return new Point($parts[0], $parts[1]);
	}

	private function parseLineString($dataString)
	{
		$dataString = $this->validateDate($dataString, 'LINE STRING');
		$parts = explode(',', $dataString);
		$points = [];
		foreach ($parts as $part) {
			$points[] = $this->parsePoint($part);
		}
		return new LineString($points);
	}

	private function parsePolygon($dataString)
	{
		$dataString = $this->validateDate($dataString, 'POLYGON');
		$parts = explode('),(', $dataString);
		$lines = [];
		foreach ($parts as $part) {
			if (!$this->beginsWith($part, '(')) {
				$part = '(' . $part;
			}
			if (!$this->endsWith($part, ')')) {
				$part = $part . ')';
			}
			$lines[] = $this->parseLineString($part);
		}
		return new Polygon($lines);
	}

	private function parseMultiPoint($dataString)
	{
		$dataString = $this->validateDate($dataString, 'MULTI POINT');
		$parts = explode(',', $dataString);
		$points = [];
		foreach ($parts as $part) {
			$points[] = $this->parsePoint($part);
		}
		return new MultiPoint($points);
	}

	private function parseMultiLineString($dataString)
	{
		$dataString = $this->validateDate($dataString, 'MULTI LINE STRING');
		$parts = explode('),(', $dataString);
		$lines = [];
		foreach ($parts as $part) {
			if (!$this->beginsWith($part, '(')) {
				$part = '(' . $part;
			}
			if (!$this->endsWith($part, ')')) {
				$part = $part . ')';
			}
			$lines[] = $this->parseLineString($part);
		}
		return new MultiLineString($lines);
	}

	private function parseMultiPolygon($dataString)
	{
		$dataString = $this->validateDate($dataString, 'MULTI POLYGON');
		$parts = explode(')),((', $dataString);
		$polys = [];
		foreach ($parts as $part) {
			if (!$this->beginsWith($part, '((')) {
				$part = '((' . $part;
			}
			if (!$this->endsWith($part, '))')) {
				$part = $part . '))';
			}
			$polys[] = $this->parsePolygon($part);
		}
		return new MultiPolygon($polys);
	}

	private function parseGeometryCollection($dataString)
	{
		$dataString = $this->validateDate($dataString, 'GEOMETRY COLLECTION');
		$geometries = [];
		$str = preg_replace('/,\s*([A-Za-z])/', '|$1', $dataString);
		$components = explode('|', trim($str));
		foreach ($components as $component) {
			$geometries[] = $this->read($component);
		}
		return new GeometryCollection($geometries);
	}

	protected function getDataString($wkt)
	{
		$firstParen = strpos($wkt, '(');
		if ($firstParen !== false) {
			return substr($wkt, $firstParen);
		}
		if (strstr($wkt, 'EMPTY')) {
			return 'EMPTY';
		}
		return false;
	}

	/**
	 * Trim the parenthesis and spaces
	 */
	protected function trimParens($str)
	{
		// We want to only strip off one set of parenthesis
		$str = trim($str);
		if ($this->beginsWith($str, '(')) {
			return substr($str, 1, -1);
		}
		return $str;
	}

	protected function beginsWith($str, $char)
	{
		return substr($str, 0, strlen($char)) == $char;
	}

	protected function endsWith($str, $char)
	{
		return substr($str, (0 - strlen($char))) == $char;
	}

	/**
	 * Serialize geometries into a WKT string.
	 *
	 * @param Geometry $geometry
	 *
	 * @return string The WKT string representation of the input geometries
	 */
	public function write(Geometry $geometry)
	{
		// If geos is installed, then we take a shortcut and let it write the WKT
		if (geoPHP::geosInstalled()) {
			$writer = new GEOSWKTWriter();
			$writer->setTrim(true);
			return $writer->write($geometry->geos());
		}

		if ($geometry->isEmpty()) {
			return strtoupper($geometry->geometryType()) . ' EMPTY';
		}
		$data = $this->extractData($geometry);
		if ($data) {
			return strtoupper($geometry->geometryType()) . ' (' . $data . ')';
		}
		return null;
	}

	/**
	 * Extract geometry to a WKT string
	 *
	 * @param Geometry $geometry A Geometry object
	 *
	 * @return string
	 */
	public function extractData($geometry)
	{
		$parts = [];
		switch ($geometry->geometryType()) {
			case 'Point':
				return $geometry->getX() . ' ' . $geometry->getY();
			case 'LineString':
				foreach ($geometry->getComponents() as $component) {
					$parts[] = $this->extractData($component);
				}
				return implode(', ', $parts);
			case 'Polygon':
			case 'MultiPoint':
			case 'MultiLineString':
			case 'MultiPolygon':
				foreach ($geometry->getComponents() as $component) {
					$parts[] = '(' . $this->extractData($component) . ')';
				}
				return implode(', ', $parts);
			case 'GeometryCollection':
				foreach ($geometry->getComponents() as $component) {
					$parts[] = strtoupper($component->geometryType()) . ' (' . $this->extractData($component) . ')';
				}
				return implode(', ', $parts);
		}
	}
}
