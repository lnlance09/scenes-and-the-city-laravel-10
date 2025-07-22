import { createSlice } from "@reduxjs/toolkit"
import { defaultChar, defaultImg, defaultVideo } from "@states/form"
import { initialAdminState } from "@states/admin"

const adminSlice = createSlice({
    name: "admin",
    initialState: initialAdminState,
    reducers: {
        setChar: (state, action) => {
            state.char = action.payload.char
        },
        setChars: (state, action) => {
            state.chars = [...action.payload.chars]
        },
        clearChar: (state) => {
            state.char = defaultChar
        },
        setImg: (state, action) => {
            state.img = action.payload.data
        },
        setFile: (state, action) => {
            state.file = action.payload.file
        },
        setVideo: (state, action) => {
            state.video = action.payload.video
            state.videos = []
        },
        setVideos: (state, action) => {
            state.videos = [...action.payload.videos]
        },
        setPartTwo: (state, action) => {
            state.partTwo = action.payload.partTwo
        },
        setQuizzes: (state, action) => {
            state.quizzes = action.payload.quizzes
        },
        clearForm: (state) => {
            state.char = defaultChar
            state.chars = []
            state.file = null
            state.img = defaultImg
            state.partTwo = null
            state.quizzes = []
            state.video = defaultVideo
            state.videos = []
        }
    }
})

export const {
    clearChar,
    setChar,
    setChars,
    setImg,
    setFile,
    setPartTwo,
    setQuizzes,
    setVideo,
    setVideos,
    clearForm
} = adminSlice.actions
export default adminSlice.reducer
