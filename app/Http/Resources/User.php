<?php

namespace App\Http\Resources;

use App\Http\Resources\Setting as SettingResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'username' => $this->username,
            'settings' => new SettingResource($this->setting)
        ];
    }
}
