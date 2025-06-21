import { Flag } from "semantic-ui-react"

export const languages = [
    {
        key: "en",
        text: "English",
        value: "en",
        content: (
            <>
                English <Flag name="us" />
            </>
        )
    },
    {
        key: "es",
        text: "Español",
        value: "es",
        content: (
            <>
                Español <Flag name="es" />
            </>
        )
    },
    {
        key: "cn",
        text: "官话",
        value: "cn",
        content: (
            <>
                官话 <Flag name="cn" />
            </>
        )
    }
]
