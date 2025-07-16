import { createSlice } from "@reduxjs/toolkit"
import { initialAppState } from "../states/app"

const appSlice = createSlice({
    name: "app",
    initialState: initialAppState,
    reducers: {
        logout: (state) => {
            state.auth = false
            state.hardMode = false
            state.user = { settings: {} }
            state.verify = false
        },
        setHardMode: (state, action) => {
            state.hardMode = action.payload.hardMode
        },
        setDarkMode: (state, action) => {
            state.inverted = action.payload.darkMode
        },
        setLanguage: (state, action) => {
            state.language = action.payload.language
        },
        setNeedToVerify: (state) => {
            state.verify = true
        },
        setReveal: (state, action) => {
            state.reveal = action.payload.reveal
        },
        setUnits: (state, action) => {
            state.units = action.payload.units
        },
        setUserData: (state, action) => {
            state.auth = true
            state.user = action.payload.user
        },
        toggleInverted: (state) => {
            state.inverted = !state.inverted
        },
        verifyEmail: (state) => {
            state.verify = false
        }
    }
})

export const {
    logout,
    setDarkMode,
    setHardMode,
    setLanguage,
    setReveal,
    setUnits,
    setUserData,
    setNeedToVerify,
    toggleInverted,
    verifyEmail
} = appSlice.actions
export default appSlice.reducer
