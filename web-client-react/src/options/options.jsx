import { Icon } from "semantic-ui-react"
import * as translations from "../assets/translate.json"

export const options = (language) => [
    {
        key: "settings",
        text: "Settings",
        value: "settings",
        className: "inverted",
        content: (
            <>
                {translations[language].header.settings} <Icon name="cog" />
            </>
        )
    },
    {
        key: "stats",
        text: "Stats",
        value: "stats",
        content: (
            <>
                {translations[language].header.stats} <Icon name="chart bar" />
            </>
        )
    },
    {
        key: "history",
        text: "History",
        value: "history",
        content: (
            <>
                {translations[language].header.history} <Icon name="history" />
            </>
        )
    },
    {
        key: "leaderboard",
        text: "Leader Board",
        value: "leaderboard",
        content: (
            <>
                {translations[language].header.leaderboard} <Icon name="trophy" />
            </>
        )
    }
]
