<?php

/**
 * MultiPoint: A collection Points  
 */
class MultiPoint extends Collection
{
	protected $geomType = 'MultiPoint';

	public function numPoints()
	{
		return $this->numGeometries();
	}

	public function isSimple()
	{
		return true;
	}

	// Not valid for this geometry type
	// --------------------------------
	public function explode()
	{
		return null;
	}
}
