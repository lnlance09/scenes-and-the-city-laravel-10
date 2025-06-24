import { createSlice } from "@reduxjs/toolkit"
import { initialAppState } from "../states/app"

const appSlice = createSlice({
    name: "app",
    initialState: initialAppState,
    reducers: {
        logout: (state, action) => {},
        setUserData: (state, action) => {},
        toggleInverted: (state) => {
            state.inverted = !state.inverted
        },
        setLanguage: (state, action) => {
            state.language = action.payload.language
        },
        verifyEmail: (state, action) => {}
    }
})

export const { logout, setUserData, toggleInverted, setLanguage, verifyEmail } = appSlice.actions
export default appSlice.reducer
