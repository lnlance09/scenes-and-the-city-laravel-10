import { useTimer } from "react-timer-hook"
import PropTypes from "prop-types"

const Timer = ({ expiryTimestamp }) => {
    // eslint-disable-next-line no-unused-vars
    const { seconds, minutes, hours, pause, resume } = useTimer({
        expiryTimestamp,
        interval: 1000,
        onExpire: () => console.warn("onExpire called")
    })

    const secs = `${seconds}`.padStart(1, "0")
    const mins = `${minutes}`.padStart(1, "0")
    const hoursLeft = `${hours}`.padStart(1, "0")
    return <>{`${hoursLeft} hours ${mins} minutes ${secs} seconds`}</>
}

Timer.propTypes = {
    expiryTimestamp: PropTypes.instanceOf(Date)
}

export default Timer
