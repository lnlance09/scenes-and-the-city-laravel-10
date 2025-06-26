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
        $scene = $this->scene;
        $video = $scene->video;
        $action = $scene->action;
        $character = $scene->characters[0]->character;
        $charName = "{$character->first_name} {$character->last_name}";
        $year = $video->year;
        $actionName = $action->action->name;
        $text = "It's {$year} and {$charName} is seen here {$actionName}";

        return [
            'quizId' => $this->quiz_id,
            'username' => $this->user->username,
            'text' => $text,
            'createdAt' => $this->created_at
        ];
    }
}
