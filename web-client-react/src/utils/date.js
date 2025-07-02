import moment from "moment-timezone"

export const dateFormat = "M-D-YY"
export const nyc = "America/New_York"

export const isSunday = (d = null) =>
    d ? moment(d).tz(nyc).day() === 0 : moment().tz(nyc).day() === 0

export const isWeekend = (d = null) =>
    isSunday(d) || (d ? moment(d).tz(nyc).day() === 6 : moment().tz(nyc).day() === 6)

export const isValidDate = (date) => moment(date, "YYYY-MM-DD HH:mm:ss", true).isValid()
