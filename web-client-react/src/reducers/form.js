import { createSlice } from "@reduxjs/toolkit"
import {
    defaultAction,
    defaultChar,
    defaultImg,
    defaultLocation,
    defaultVideo,
    initialFormState
} from "../states/form"

const formSlice = createSlice({
    name: "form",
    initialState: initialFormState,
    reducers: {
        setImg: (state, action) => {
            state.img = action.payload.data
        },
        setVideo: (state, action) => {
            state.video = action.payload.video
            state.videos = []
        },
        setVideos: (state, action) => {
            state.videos = [...action.payload.videos]
        },
        setChar: (state, action) => {
            state.char = action.payload.char
        },
        setChars: (state, action) => {
            state.chars = [...action.payload.chars]
        },
        clearChar: (state) => {
            state.char = defaultChar
        },
        setActions: (state, action) => {
            // Used on home page only once
            state.actions = action.payload.actions
        },
        setAction: (state, action) => {
            const { id, key, name, text, value } = action.payload.action
            state.action = {
                id,
                key,
                name,
                text,
                value
            }
        },
        addAction: (state, action) => {
            state.actions = [...state.actions, action.payload.action]
        },
        setLocation: (state, action) => {
            state.location = action.payload.location
        },
        clearForm: (state) => {
            state.action = defaultAction
            state.char = defaultChar
            state.chars = []
            state.img = defaultImg
            state.location = defaultLocation
            state.video = defaultVideo
            state.videos = []
        }
    }
})

export const {
    addAction,
    clearForm,
    setAction,
    setActions,
    clearChar,
    setChar,
    setChars,
    setImg,
    setLocation,
    setVideo,
    setVideos
} = formSlice.actions
export default formSlice.reducer
