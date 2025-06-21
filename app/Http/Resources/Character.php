<?php

namespace App\Http\Resources;

use App\Http\Resources\Actor as ActorResource;
use App\Http\Resources\Video as VideoResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Character extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'actor' => new ActorResource($this->actor),
            // 'video' => new VideoResource($this->video)
        ];
    }
}
