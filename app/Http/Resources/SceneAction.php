<?php

namespace App\Http\Resources;

use App\Http\Resources\Action as ActionResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Resources\Json\JsonResource;

class SceneAction extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'action' => new ActionResource($this->action),
        ];
    }
}
