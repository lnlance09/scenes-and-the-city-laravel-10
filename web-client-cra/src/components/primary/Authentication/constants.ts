export const PASSWORD_RECOVERY_SENT = "PASSWORD_RECOVERY_SENT"
export const SET_FORGOT = "SET_FORGOT"
export const SET_LOGIN = "SET_LOGIN"
export const SET_REGISTER = "SET_REGISTER"
export const SET_VERIFY = "SET_VERIFY"

export type AuthActionType =
    | "PASSWORD_RECOVERY_SENT"
    | "SET_FORGOT"
    | "SET_LOGIN"
    | "SET_REGISTER"
    | "SET_VERIFY"

export type AuthAction = {
    type: AuthActionType
}
