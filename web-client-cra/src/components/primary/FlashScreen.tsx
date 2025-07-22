import { useEffect, useRef } from "react"
import satcBeat from "@assets/satc-beat.m4a"
import satcEnding from "@assets/satc-ending.m4a"
import satcJingle from "@assets/satc-jingle.m4a"
import classNames from "classnames"

type SATCMusicType = "beat" | "ending" | "jingle"
type Props = {
    clip?: SATCMusicType
    open?: boolean
    text?: string
}

const FlashScreen = ({ clip = "beat", open = false, text = "" }: Props) => {
    const beatRef = useRef<HTMLAudioElement>(null)
    const jingleRef = useRef<HTMLAudioElement>(null)
    const endingRef = useRef<HTMLAudioElement>(null)

    const flashClass = classNames({
        flashScreen: true,
        flashing: open
    })

    useEffect(() => {
        if (!open) {
            return
        }
        if (clip === "beat" && beatRef.current !== null) {
            beatRef.current.play()
        }
        if (clip === "ending" && endingRef.current !== null) {
            endingRef.current.play()
        }
        if (clip === "jingle" && jingleRef.current !== null) {
            jingleRef.current.play()
        }
    }, [open, clip])

    return (
        <div className={flashClass}>
            <div className={open ? "animateIn" : "animateOut"}>
                <p>{text}</p>
            </div>
            <audio ref={beatRef} src={satcBeat} />
            <audio ref={jingleRef} src={satcEnding} />
            <audio ref={endingRef} src={satcJingle} />
        </div>
    )
}

export default FlashScreen
