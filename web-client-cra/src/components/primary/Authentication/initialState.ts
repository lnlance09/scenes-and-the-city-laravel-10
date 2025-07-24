import { Nullable } from "@interfaces/index"

type HeaderKey = "resetPassword" | "signIn" | "signUp" | "verifyEmail"

export type AuthState = {
    headerKey: Nullable<HeaderKey>
    login: boolean
    register: boolean
    forgot: boolean
    passwordReset: boolean
}

export const initialAuthState: AuthState = {
    headerKey: "signIn",
    login: true,
    register: false,
    forgot: false,
    passwordReset: false
}
