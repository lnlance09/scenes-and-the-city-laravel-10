export const appendClassName = (className, inverted) => {
    return `${className}${inverted ? " inverted" : ""}`
}

export const capitalize = (str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`
