import { createSlice } from "@reduxjs/toolkit"
import { initialHomeState } from "../states/home"

const homeSlice = createSlice({
    name: "home",
    initialState: initialHomeState,
    reducers: {
        setQuiz: (state, action) => {
            state.quiz = action.payload.quiz
        }
    }
})

export const { setQuiz } = homeSlice.actions

export default homeSlice.reducer
