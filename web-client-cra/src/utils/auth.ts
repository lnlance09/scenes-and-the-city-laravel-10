import { Nullable, Setting, User } from "../interfaces"

export const setSessionData = (
    auth: Nullable<number>,
    bearer: Nullable<string>,
    verify: Nullable<number>,
    settings: Setting,
    user: User
) => {
    if (auth) {
        localStorage.setItem("auth", `${auth}`)
    }
    if (bearer) {
        localStorage.setItem("bearer", bearer)
    }
    if (settings) {
        localStorage.setItem("hardMode", `${settings.hardMode}`)
        localStorage.setItem("inverted", `${settings.darkMode}`)
        localStorage.setItem("lang", settings.lang)
        localStorage.setItem("reveal", `${settings.revealAnswers}`)
        localStorage.setItem("units", settings.measureUnits)
    }
    if (user) {
        localStorage.setItem("user", JSON.stringify(user))
    }
    if (verify) {
        localStorage.setItem("verify", `${verify}`)
    }
}

export const resetSessionData = () => {
    localStorage.setItem("auth", "0")
    localStorage.setItem("bearer", "")
    localStorage.setItem("hardMode", "0")
    localStorage.setItem("reveal", "0")
    localStorage.setItem("units", "miles")
    localStorage.setItem("user", JSON.stringify({}))
    localStorage.setItem("verify", "0")
}
