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
        addAction: (state, action) => {
            state.actions = [...state.actions, action.payload.action]
        },
        clearChar: (state) => {
            state.char = defaultChar
        },
        setAction: (state, action) => {
            const { key, name, text, value } = action.payload.action
            state.action = {
                id: 0,
                key,
                name,
                text,
                value
            }
        },
        setActions: (state, action) => {
            state.actions = action.payload.actions
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
