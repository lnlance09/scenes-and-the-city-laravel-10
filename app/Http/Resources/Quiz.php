<?php

namespace App\Http\Resources;

use Carbon\Carbon;
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
        $awsUrl = env('AWS_URL', 'https://blather-new.s3.us-west-2.amazonaws.com/');
        $scene = $this->scene;
        $characters = $scene->characters;
        $character = $characters[0]->character;

        return [
            'id' => $this->quiz_id,
            'img' => $awsUrl . $scene->pics[0]->s3_url,
            'distance' => $this->distance ? $this->distance : null,
            'geoData' => $this->reveal_answer ? $this->geo_data : null,
            'hintOne' => $this->reveal_hint_one ? $this->hint_one : null,
            'hintTwo' => $this->reveal_hint_two ? $this->hint_two : null,
            'video' => [
                'title' => $scene->video->title,
                'year' => $scene->video->year,
                'img' => $scene->video->img,
            ],
            'char' => [
                'firstName' => $character->first_name,
                'lastName' => $character->last_name,
                'img' => count($character->pics) > 0 ? $awsUrl . $character->pics[0]->s3_url : null,
            ],
            'action' => $scene->action->action->name,
            'username' => $this->user->username,
            'createdAt' =>  Carbon::createFromFormat('Y-m-d H:i:s', $this->created_at, 'America/New_York')->toDateTimeString()
        ];
    }
}
