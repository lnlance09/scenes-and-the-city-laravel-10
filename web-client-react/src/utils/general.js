export const capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`

export const formatPlural = (count, term) => {
    if (term.substr(term.length - 1) === "y") {
        const word = term.substring(0, term.length - 1)
        return parseInt(count, 10) === 1 ? term : `${word}ies`
    }
    return parseInt(count, 10) === 1 ? term : `${term}s`
}

export const timeout = (delay) => new Promise((res) => setTimeout(res, delay))
