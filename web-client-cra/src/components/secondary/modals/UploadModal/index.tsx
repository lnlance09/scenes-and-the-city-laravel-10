import { Divider, Icon, Step } from "semantic-ui-react"
import { useDispatch } from "react-redux"
import { useState } from "react"
import { useSelector } from "react-redux"
import { ReduxState } from "@interfaces/index"
import { clearForm } from "@/reducers/form"
import { timeout } from "@utils/general"
import AnswerTab from "./tabs/answer"
import classNames from "classnames"
import confetti from "canvas-confetti"
import FlashScreen from "@components/primary/FlashScreen"
import ImageUpload from "./tabs/image"
import InfoSegment from "./tabs/info"
import ModalComponent from "@components/primary/Modal"
import translations from "@assets/translate.json"

const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"]
}

type Props = {
    modalOpen?: boolean
    setModalOpen: (open: boolean) => any
}

const UploadModal = ({ modalOpen = false, setModalOpen }: Props) => {
    const dispatch = useDispatch()
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const action = useSelector((state: ReduxState) => state.form.action)
    const img = useSelector((state: ReduxState) => state.form.img)
    const char = useSelector((state: ReduxState) => state.form.char)
    const video = useSelector((state: ReduxState) => state.form.video)

    const [pageNum, setPageNum] = useState(1)
    const [videoType, setVideoType] = useState(1)
    const [videoVal, setVideoVal] = useState("")
    const [videosVisible, setVideosVisible] = useState(false)
    const [charsVisible, setCharsVisible] = useState(false)
    const [actionsVisible, setActionsVisible] = useState(false)
    const [charIsSelf, setCharIsSelf] = useState(false)
    const [actorName, setActorName] = useState("")
    const [charName, setCharName] = useState("")
    const [flashOpen, setFlashOpen] = useState(false)
    const [quizVal, setQuizVal] = useState("")
    const [quizzesVisible, setQuizzesVisible] = useState(false)

    const imgEmpty = img.path === null
    const videoEmpty = video.id === null
    const charEmpty = char.id === null
    const actionEmpty = action.id === null
    const answerStepDisabled = imgEmpty || videoEmpty || charEmpty || actionEmpty

    const modalClass = {
        submitSceneModal: true
    }
    const stepClass = classNames({ inverted })

    const showConfetti = () => {
        confetti({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ["star"]
        })
        confetti({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ["circle"]
        })
    }

    return (
        <>
            <ModalComponent
                callback={() => setModalOpen(false)}
                className={modalClass}
                open={modalOpen}
                title={lang.header.makeAQuiz}
            >
                <Step.Group fluid widths="three" size="large">
                    <Step
                        active={pageNum === 1}
                        className={stepClass}
                        onClick={() => setPageNum(1)}
                    >
                        <Icon inverted={inverted} name="picture" />
                        <Step.Content>
                            <Step.Title>{lang.stepOne.name}</Step.Title>
                            {/*<Step.Description>{lang.stepOne.description}</Step.Description>*/}
                        </Step.Content>
                    </Step>
                    <Step
                        active={pageNum === 2}
                        className={stepClass}
                        disabled={pageNum === 1 || imgEmpty}
                        onClick={() => setPageNum(2)}
                    >
                        <Icon inverted={inverted} name="info" />
                        <Step.Content>
                            <Step.Title>{lang.stepTwo.name}</Step.Title>
                            {/*<Step.Description>{lang.stepTwo.description}</Step.Description>*/}
                        </Step.Content>
                    </Step>
                    <Step
                        active={pageNum === 3}
                        className={stepClass}
                        disabled={pageNum !== 3 || answerStepDisabled}
                        onClick={() => setPageNum(3)}
                    >
                        <Icon inverted={inverted} name="world" />
                        <Step.Content>
                            <Step.Title>{lang.stepThree.name}</Step.Title>
                            {/*<Step.Description>{lang.stepThree.description}</Step.Description>*/}
                        </Step.Content>
                    </Step>
                </Step.Group>
                <Divider inverted={inverted} section />
                {pageNum === 1 && <ImageUpload callback={() => setPageNum(2)} />}
                {pageNum === 2 && (
                    <InfoSegment
                        actionsVisible={actionsVisible}
                        actorName={actorName}
                        charName={charName}
                        callback={() => setPageNum(3)}
                        charIsSelf={charIsSelf}
                        charsVisible={charsVisible}
                        videosVisible={videosVisible}
                        videoVal={videoVal}
                        videoType={videoType}
                        setActionsVisible={(visible) => setActionsVisible(visible)}
                        setActorName={(name) => setActorName(name)}
                        setCharName={(name) => setCharName(name)}
                        setCharIsSelf={(isSelf) => setCharIsSelf(isSelf)}
                        setCharsVisible={(visible) => setCharsVisible(visible)}
                        setVideosVisible={(visible) => setVideosVisible(visible)}
                        setVideoVal={(val) => setVideoVal(val)}
                        setVideoType={(type) => setVideoType(type)}
                    />
                )}
                {pageNum === 3 && (
                    <AnswerTab
                        callback={async () => {
                            setFlashOpen(true)
                            await timeout(3000)
                            dispatch(clearForm())
                            setPageNum(1)
                            setModalOpen(false)
                            setVideoVal("")
                            setVideosVisible(false)
                            setCharsVisible(false)
                            setActionsVisible(false)
                            setQuizzesVisible(false)
                            setQuizVal("")
                            await timeout(9000)
                            setFlashOpen(false)
                        }}
                        quizVal={quizVal}
                        quizzesVisible={quizzesVisible}
                        setQuizVal={(value) => setQuizVal(value)}
                        setQuizzesVisible={(visible) => setQuizzesVisible(visible)}
                    />
                )}
            </ModalComponent>
            <FlashScreen clip="jingle" open={flashOpen} text={lang.stepThree.successMsg} />
        </>
    )
}

export default UploadModal
