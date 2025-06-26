<?php

namespace App\Http\Resources;

use App\Http\Resources\SceneAction as SceneActionResource;
use App\Http\Resources\SceneCharacter as SceneCharacterResource;
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
            'action' => new SceneActionResource($this->action),
            'characters' => new SceneCharacterCollection($this->characters),
            'video' => new VideoResource($this->video),
        ];
    }
}
