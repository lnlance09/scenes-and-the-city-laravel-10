import { createSlice } from "@reduxjs/toolkit"
import { initialAppState } from "../states/app"

const appSlice = createSlice({
    name: "app",
    initialState: initialAppState,
    reducers: {
        logout: (state) => {
            state.auth = false
            state.bearer = null
            state.user = null
            state.verify = false
        },
        setLanguage: (state, action) => {
            state.language = action.payload.language
        },
        setNeedToVerify: (state) => {
            state.verify = true
        },
        toggleInverted: (state) => {
            state.inverted = !state.inverted
        },
        verifyEmail: (state) => {
            state.verify = false
        },
        setUserData: (state, action) => {
            state.auth = true
            state.user = action.payload.data
        }
    }
})

export const { logout, setUserData, toggleInverted, setLanguage, setNeedToVerify, verifyEmail } =
    appSlice.actions
export default appSlice.reducer
