import { createSlice } from "@reduxjs/toolkit"
import { defaultAnswer, defaultHistoryData, defaultQuiz, initialHomeState } from "@states/home"

const homeSlice = createSlice({
    name: "home",
    initialState: initialHomeState,
    reducers: {
        addAnswer: (state) => {
            state.answers = [...state.answers, defaultAnswer]
        },
        clearQuiz: (state) => {
            state.quiz = defaultQuiz
        },
        clearPartTwo: (state) => {
            state.partTwo = null
        },
        clearAnswer: (state) => {
            state.answers = [defaultAnswer]
        },
        setAnswerGeoData: (state, action) => {
            state.answers[action.payload.index].geoData = {
                lat: action.payload.geoData.lat,
                lng: action.payload.geoData.lng,
                hood: action.payload.geoData.hood,
                borough: action.payload.geoData.borough,
                streets: action.payload.geoData.streets
            }
        },
        setCorrect: (state, action) => {
            state.answers[action.payload.index].correct = action.payload.correct
        },
        setHasAnswered: (state, action) => {
            state.answers[action.payload.index].hasAnswered = action.payload.hasAnswered
        },
        setHintOne: (state, action) => {
            state.quiz.hintOne = action.payload.hint
        },
        setHintTwo: (state, action) => {
            state.quiz.hintTwo = action.payload.hint
        },
        setHintsUsed: (state, action) => {
            state.answers[action.payload.index].hintsUsed = action.payload.hintsUsed
        },
        setYouTubeId: (state, action) => {
            state.quiz.youtubeId = action.payload.id
        },
        setMarginOfError: (state, action) => {
            state.answers[action.payload.index].marginOfError = action.payload.margin
        },
        setHistoryAnswers: (state, action) => {
            state.history.answers = action.payload.answers
        },
        resetHistoryAnswers: (state) => {
            state.history.answers = defaultHistoryData
        },
        setHistoryQuizzes: (state, action) => {
            state.history.quizzes = action.payload.quizzes
        },
        resetHistoryQuizzes: (state) => {
            state.history.quizzes = defaultHistoryData
        },
        setQuiz: (state, action) => {
            state.quiz = action.payload.quiz
        },
        setPartTwo: (state, action) => {
            state.partTwo = action.payload.partTwo
        }
    }
})

export const {
    addAnswer,
    clearAnswer,
    clearQuiz,
    clearPartTwo,
    setAnswerGeoData,
    setCorrect,
    setHasAnswered,
    setHintOne,
    setHintTwo,
    setHintsUsed,
    setMarginOfError,
    setHistoryAnswers,
    setHistoryQuizzes,
    resetHistoryAnswers,
    resetHistoryQuizzes,
    setQuiz,
    setYouTubeId,
    setPartTwo
} = homeSlice.actions

export default homeSlice.reducer
