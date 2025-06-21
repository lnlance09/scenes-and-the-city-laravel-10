<?php

namespace App\Http\Resources;

use App\Http\Resources\SceneCharacterCollection;
use App\Http\Resources\Video as VideoResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Scene extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'characters' => new SceneCharacterCollection($this->sceneCharacters),
            'video' => new VideoResource($this->video),
        ];
    }
}
