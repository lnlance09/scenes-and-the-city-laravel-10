<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Setting extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'hardMode' => $this->hard_mode,
            'darkMode' => $this->dark_mode,
            'lang' => $this->lang,
            'measureUnits' => $this->measure_units_in,
            'revealAnswers' => $this->reveal_answers
        ];
    }
}
