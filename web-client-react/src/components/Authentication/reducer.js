import {
    PASSWORD_RECOVERY_SENT,
    SET_FORGOT,
    SET_LOGIN,
    SET_REGISTER,
    SET_VERIFY
} from "./constants"

export const reducer = (state, action) => {
    switch (action.type) {
        case PASSWORD_RECOVERY_SENT:
            return {
                ...state,
                headerText: "",
                forgot: false,
                passwordReset: true
            }
        case SET_FORGOT:
            return {
                ...state,
                headerText: "Reset your password",
                footerLinkText: "Sign In",
                footerText: "Already have an account?",
                showFooter: false,
                forgot: true,
                login: false,
                register: false
            }
        case SET_LOGIN:
            return {
                ...state,
                headerText: "Sign In",
                footerLinkText: "Create an account",
                footerText: "New to this site?",
                showFooter: true,
                forgot: false,
                login: true,
                register: false,
                passwordReset: false
            }
        case SET_REGISTER:
            return {
                ...state,
                headerText: "Sign Up",
                footerLinkText: "Sign in",
                footerText: "Already have an account?",
                showFooter: true,
                forgot: false,
                login: false,
                register: true,
                passwordReset: false
            }
        case SET_VERIFY:
            return {
                ...state,
                headerText: "Verify your email",
                footerLinkText: "",
                footerText: "",
                showFooter: false,
                forgot: false,
                login: false,
                register: false,
                passwordReset: false
            }
        default:
            throw new Error()
    }
}
