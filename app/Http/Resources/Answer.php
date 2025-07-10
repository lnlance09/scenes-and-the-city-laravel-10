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
            'correct' => $this->correct,
            'lat' => (float)$this->lat,
            'lng' => (float)$this->lng,
            'hintsUsed' => $this->hints_used,
            'quiz' => [
                'id' => $this->quiz->quiz_id,
                'img' => env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/') . $this->quiz->scene->pics[0]->s3_url,
                'video' => [
                    'title' => $this->quiz->scene->video->title,
                    'year' => $this->quiz->scene->video->year
                ],

            ],
            'createdAt' => $this->created_at
        ];
    }
}
