import { createSlice } from "@reduxjs/toolkit"

let auth = localStorage.getItem("auth")
let bearer = localStorage.getItem("bearer")
let inverted = localStorage.getItem("inverted")
let language = localStorage.getItem("language")
let user = localStorage.getItem("user")
let verify = localStorage.getItem("verify")

const initialState = {
    auth: auth === null || auth === "false" ? false : true,
    bearer,
    inverted: inverted === "true",
    language: language || "en",
    user: user === null ? {} : JSON.parse(user),
    verify: verify === null || verify === "false" ? false : true
}

const appSlice = createSlice({
    name: "app",
    initialState,
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
