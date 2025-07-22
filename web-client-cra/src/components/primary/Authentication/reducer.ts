import { Reducer } from "react"
import {
    AuthAction,
    PASSWORD_RECOVERY_SENT,
    SET_FORGOT,
    SET_LOGIN,
    SET_REGISTER,
    SET_VERIFY
} from "./constants"
import { AuthState } from "./initialState"

export const reducer: Reducer<AuthState, AuthAction> = (state, action) => {
    switch (action.type) {
        case PASSWORD_RECOVERY_SENT:
            return {
                ...state,
                headerKey: null,
                forgot: false,
                passwordReset: true
            }
        case SET_FORGOT:
            return {
                ...state,
                headerKey: "resetPassword",
                forgot: true,
                login: false,
                register: false
            }
        case SET_LOGIN:
            return {
                ...state,
                headerKey: "signIn",
                forgot: false,
                login: true,
                register: false,
                passwordReset: false
            }
        case SET_REGISTER:
            return {
                ...state,
                headerKey: "signUp",
                forgot: false,
                login: false,
                register: true,
                passwordReset: false
            }
        case SET_VERIFY:
            return {
                ...state,
                headerKey: "verifyEmail",
                forgot: false,
                login: false,
                register: false,
                passwordReset: false
            }
        default:
            throw new Error()
    }
}
