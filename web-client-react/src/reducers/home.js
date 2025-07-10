import { createSlice } from "@reduxjs/toolkit"
import { defaultAnswer, defaultQuiz, initialHomeState } from "../states/home"

const homeSlice = createSlice({
    name: "home",
    initialState: initialHomeState,
    reducers: {
        clearQuiz: (state) => {
            state.quiz = defaultQuiz
        },
        clearAnswer: (state) => {
            state.answer = {
                ...defaultAnswer,
                lat: 40.758896,
                lng: -73.98513
            }
            state.hasAnswered = false
        },
        setAnswer: (state, action) => {
            state.answer = {
                ...state.answer,
                lat: action.payload.lat,
                lng: action.payload.lng,
                hood: action.payload.hood,
                borough: action.payload.borough,
                streets: action.payload.streets
            }
        },
        setHasAnswered: (state, action) => {
            state.hasAnswered = action.payload.hasAnswered
        },
        setHintOne: (state, action) => {
            state.quiz.hintOne = action.payload.hint
        },
        setHintTwo: (state, action) => {
            state.quiz.hintTwo = action.payload.hint
        },
        setHintsUsed: (state, action) => {
            state.answer.hintsUsed = action.payload.amount
        },
        setHistoryAnswers: (state, action) => {
            state.history.answers = action.payload.answers
        },
        setHistoryQuizzes: (state, action) => {
            state.history.quizzes = action.payload.quizzes
        },
        setQuiz: (state, action) => {
            state.quiz = action.payload.quiz
        }
    }
})

export const {
    clearAnswer,
    clearQuiz,
    setAnswer,
    setHasAnswered,
    setHintOne,
    setHintTwo,
    setHintsUsed,
    setHistoryAnswers,
    setHistoryQuizzes,
    setQuiz
} = homeSlice.actions

export default homeSlice.reducer
