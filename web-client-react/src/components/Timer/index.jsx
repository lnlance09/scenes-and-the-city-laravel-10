import { useTimer } from "react-timer-hook"
import { useSelector } from "react-redux"
import { formatPlural } from "../../utils/general"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const Timer = ({ expiryTimestamp }) => {
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    // eslint-disable-next-line no-unused-vars
    const { seconds, minutes, hours, pause, resume } = useTimer({
        expiryTimestamp,
        interval: 1000,
        onExpire: () => console.warn("onExpire called")
    })

    const secs = `${seconds}`.padStart(1, "0")
    const mins = `${minutes}`.padStart(1, "0")
    const hoursLeft = `${hours}`.padStart(1, "0")
    return (
        <>{`${hoursLeft} ${formatPlural(hoursLeft, lang.time.hour)} ${mins} ${formatPlural(mins, lang.time.minute)} ${secs} ${formatPlural(secs, lang.time.second)}`}</>
    )
}

Timer.propTypes = {
    expiryTimestamp: PropTypes.instanceOf(Date)
}

export default Timer
