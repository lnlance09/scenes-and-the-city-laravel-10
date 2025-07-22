import { Language } from "../interfaces"
import translations from "@assets/translate.json"

export const translateWeekday = (day: string, language: Language) => {
    const index = translations.en.allDays.findIndex((d) => d === day)
    return translations[language].allDays[index]
}

export const translateMonth = (month: string, language: Language) => {
    const index = translations.en.months.findIndex((m) => m === month)
    return translations[language].months[index]
}
