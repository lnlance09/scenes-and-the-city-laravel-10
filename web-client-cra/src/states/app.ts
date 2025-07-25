import { InitialAppState } from "../interfaces"

const auth = localStorage.getItem("auth")
const hardMode = localStorage.getItem("hardMode")
const inverted = localStorage.getItem("inverted")
const lang = localStorage.getItem("lang")
const reveal = localStorage.getItem("reveal")
const units = localStorage.getItem("units")
const user = localStorage.getItem("user")
const verify = localStorage.getItem("verify")

export const initialAppState: InitialAppState = {
    auth: auth === "1",
    hardMode: hardMode === "1",
    inverted: inverted === "1" || inverted === null,
    language: lang === "en" || lang === "es" || lang === "cn" ? lang : "en",
    reveal: reveal === "1",
    units: units === "miles" || units === "kilometers" ? units : "miles",
    user: user ? JSON.parse(user) : { username: "" },
    verify: verify === "1"
}
