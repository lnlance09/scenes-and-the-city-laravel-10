<?php

namespace App\Http\Resources;

use App\Http\Resources\Scene as SceneResource;
use App\Http\Resources\User as UserResource;
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
            'img' => $this->img,
            'createdAt' => $this->created_at,
            'scene' => new SceneResource($this->scene),
            'user' => new UserResource($this->user),
        ];
    }
}
