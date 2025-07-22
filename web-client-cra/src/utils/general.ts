import { Actor, FullChar, Units } from "../interfaces"

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
