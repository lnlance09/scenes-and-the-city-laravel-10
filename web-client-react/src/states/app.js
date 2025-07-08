const auth = localStorage.getItem("auth")
const bearer = localStorage.getItem("bearer")
const hardMode = localStorage.getItem("hardMode")
const inverted = localStorage.getItem("inverted")
const lang = localStorage.getItem("lang")
const reveal = localStorage.getItem("reveal")
const units = localStorage.getItem("units")
const user = localStorage.getItem("user")
const verify = localStorage.getItem("verify")

export const initialAppState = {
    auth: auth === "1",
    bearer,
    hardMode: hardMode === "1",
    inverted: inverted === "1",
    language: lang || "en",
    reveal: reveal === "1",
    units: ["miles", "kilometers"].includes(units) ? units : "miles",
    user: user === null ? { settings: {} } : JSON.parse(user),
    verify: verify === "1"
}
