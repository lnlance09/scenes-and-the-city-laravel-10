import { createSlice } from "@reduxjs/toolkit"
import { defaultQuiz, initialHomeState } from "../states/home"

const homeSlice = createSlice({
    name: "home",
    initialState: initialHomeState,
    reducers: {
        clearQuiz: (state) => {
            state.quiz = defaultQuiz
        },
        setAnswer: (state, action) => {
            state.answer = {
                lat: action.payload.lat,
                lng: action.payload.lng,
                hood: action.payload.hood,
                borough: action.payload.borough,
                streets: action.payload.streets
            }
        },
        setQuiz: (state, action) => {
            state.quiz = action.payload.quiz
        }
    }
})

export const { clearQuiz, setAnswer, setQuiz } = homeSlice.actions

export default homeSlice.reducer
