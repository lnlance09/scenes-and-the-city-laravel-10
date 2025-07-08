<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Quiz extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'quizId' => $this->quiz_id,
            'img' => env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/') . $this->scene->pics[0]->s3_url,
            'username' => $this->user->username,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'createdAt' => $this->created_at
        ];
    }
}
