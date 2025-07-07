import "./index.scss"
import classNames from "classnames"
import satcBeat from "../../assets/satc-beat.m4a"
import satcJingle from "../../assets/satc-jingle.m4a"
import satcEnding from "../../assets/satc-ending.m4a"
import { useEffect, useRef } from "react"
import PropTypes from "prop-types"

const FlashScreen = ({ open = false, text = "" }) => {
    const beatRef = useRef(null)
    const jingleRef = useRef(null)
    const endingRef = useRef(null)

    const flashClass = classNames({
        flashScreen: true,
        flashing: open
    })

    useEffect(() => {
        if (open && endingRef.current) {
            endingRef.current.play()
        }
    }, [open])

    return (
        <div className={flashClass}>
            <div className={open ? "animateIn" : "animateOut"}>
                <p>{text}</p>
            </div>
            <audio ref={beatRef} src={satcBeat} />
            <audio ref={jingleRef} src={satcJingle} />
            <audio ref={endingRef} src={satcEnding} />
        </div>
    )
}

FlashScreen.propTypes = {
    open: PropTypes.bool,
    text: PropTypes.string
}

export default FlashScreen
