<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActionCollection as ActionCollection;
use App\Models\Action;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ActionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index(Request $request)
    {
        return new ActionCollection(Action::all());
    }
}
