import { Actor, FullChar, Nullable, Setting, Units, User } from "../interfaces"

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
        localStorage.setItem("lang", `${settings.lang}`)
        localStorage.setItem("reveal", `${settings.revealAnswers}`)
        localStorage.setItem("units", `${settings.measureUnits}`)
    }
    if (user) {
        localStorage.setItem("user", JSON.stringify(user))
    }
    if (verify) {
        localStorage.setItem("verify", `${verify}`)
    }
}

export const capitalize = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

export const formatPlural = (count: number, term: string) => {
    if (term.substr(term.length - 1) === "y") {
        const word = term.substring(0, term.length - 1)
        return count === 1 ? term : `${word}ies`
    }
    return count === 1 ? term : `${term}s`
}

export const timeout = (delay: number) => new Promise((res) => setTimeout(res, delay))

export const formatName = (data: FullChar | Actor) =>
    `${data.firstName}${!data.lastName ? "" : " " + data.lastName}`

export const wrapText = (text: string) => `<span class="underline">${text}</span>`

export const formatMargin = (margin: number, units: Units) =>
    units === "kilometers" ? margin * 100 : margin * 100 * 0.621371
