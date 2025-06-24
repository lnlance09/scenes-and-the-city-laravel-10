let auth = localStorage.getItem("auth")
let bearer = localStorage.getItem("bearer")
let inverted = localStorage.getItem("inverted")
let language = localStorage.getItem("language")
let user = localStorage.getItem("user")
let verify = localStorage.getItem("verify")

export const initialAppState = {
    auth: auth === null || auth === "false" ? false : true,
    bearer,
    inverted: inverted === "true",
    language: language || "en",
    user: user === null ? {} : JSON.parse(user),
    verify: verify === null || verify === "false" ? false : true
}
