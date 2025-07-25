import { Language } from "../interfaces"
import { DateTime } from "luxon"
import { translateWeekday, translateMonth } from "./translate"

export const dateFormat = "M-d-yyyy"
export const tsFormat = "yyyy-MM-dd HH:mm:ss"
export const nyc = "America/New_York"

export const isAfterToday = (date: DateTime) => date.ordinal > DateTime.now().setZone(nyc).ordinal

export const isValidDate = (date: string, format = tsFormat) =>
    DateTime.fromFormat(date, format).isValid

export const translateDate = (
    date: string,
    lang: Language,
    weekendOf = "",
    format = dateFormat
) => {
    const dateLuxon = DateTime.fromFormat(date, format).setZone(nyc)
    const day = dateLuxon.weekdayLong
    const month = dateLuxon.monthLong
    const dayOfMonth = dateLuxon.day
    const year = dateLuxon.toFormat("yyyy")
    if (!dateLuxon.isWeekend && day && month) {
        return `${translateWeekday(day, lang)}, ${translateMonth(month, lang)} ${dayOfMonth}, ${year}`
    }

    let saturday = dateLuxon
    let sunday = dateLuxon.plus({ days: 1 })
    if (dateLuxon.weekday === 7 && month) {
        saturday = dateLuxon.minus({ days: 1 })
        sunday = dateLuxon
    }

    if (saturday.monthLong && sunday.monthLong) {
        const dateRange = `${translateMonth(saturday.monthLong, lang)} ${saturday.day} - ${translateMonth(sunday.monthLong, lang)} ${sunday.day}`
        return `${weekendOf} ${dateRange}, ${year}`
    }

    return null
}
