<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Answer extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'createdAt' => $this->created_at,
            'hintsUsed' => $this->hints_used,
            'correct' => $this->correct,
            'lat' => (float)$this->lat,
            'lng' => (float)$this->lng,
            'quiz' => new Quiz($this->quiz)
        ];
    }
}
