import * as translations from "../assets/translate.json"

export const translateWeekday = (day, language) => {
    const index = translations.en.days.findIndex((d) => d === day)
    return translations[language].days[index]
}

export const translateMonth = (day, language) => {
    const index = translations.en.months.findIndex((d) => d === day)
    return translations[language].months[index]
}
