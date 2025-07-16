import Typewriter from "typewriter-effect/dist/core"

export const capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

export const formatPlural = (count, term) => {
    if (term.substr(term.length - 1) === "y") {
        const word = term.substring(0, term.length - 1)
        return parseInt(count, 10) === 1 ? term : `${word}ies`
    }
    return parseInt(count, 10) === 1 ? term : `${term}s`
}

export const timeout = (delay) => new Promise((res) => setTimeout(res, delay))

export const typeWriterEffect = (id, text, callback = () => null, delay = 75) => {
    const el = document.getElementById(id)
    const typewriter = new Typewriter(el, { delay })
    typewriter
        .typeString(text)
        .start()
        .callFunction(() => callback())
}

export const formatName = (data) => `${data.firstName}${!data.lastName ? "" : " " + data.lastName}`

export const wrapText = (text) => `<span class="underline">${text}</span>`

export const formatMargin = (margin, units) =>
    units === "kilometers" ? margin * 100 : margin * 100 * 0.621371
