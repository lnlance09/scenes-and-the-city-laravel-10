<?php

namespace App\Http\Controllers;

use App\Http\Resources\ActionCollection as ActionCollection;
use App\Models\Action;
use Illuminate\Http\Request;

class ActionController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        return new ActionCollection(Action::all());
    }
}
