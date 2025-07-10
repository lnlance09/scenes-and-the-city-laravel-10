import { translateWeekday, translateMonth } from "./translate"
import moment from "moment-timezone"

export const dateFormat = "M-D-YY"
export const nyc = "America/New_York"

export const isSunday = (d = null) =>
    d ? moment(d).tz(nyc).day() === 0 : moment().tz(nyc).day() === 0

export const isWeekend = (d = null) =>
    isSunday(d) || (d ? moment(d).tz(nyc).day() === 6 : moment().tz(nyc).day() === 6)

export const isValidDate = (date) => moment(date, "YYYY-MM-DD HH:mm:ss", true).isValid()

export const translateDate = (date, lang, isWeekend = false, weekendOf = "") => {
    const day = moment(date).format("dddd")
    const month = moment(date).format("MMMM")
    const dayOfMonth = moment(date).format("DD")
    const yearFormat = moment(date).format("YYYY")

    if (!isWeekend) {
        return `${translateWeekday(day, lang)}, ${translateMonth(month, lang)} ${dayOfMonth}, ${yearFormat}`
    }

    const nycDate = moment(date).tz(nyc)
    const minusOneDay = moment(date).tz(nyc).subtract(1, "days")
    const plusOneDay = moment(date).tz(nyc).add(1, "days")
    const saturday = isSunday(date) ? minusOneDay : nycDate
    const sunday = isSunday(date) ? nycDate : plusOneDay
    const satMonth = translateMonth(saturday.format("MMMM"), lang)
    const sunMonth = translateMonth(sunday.format("MMMM"), lang)
    const dateRange = `${satMonth} ${saturday.format("DD")} - ${sunMonth} ${sunday.format("DD")}`
    return `${weekendOf} ${dateRange}, ${yearFormat}`
}
