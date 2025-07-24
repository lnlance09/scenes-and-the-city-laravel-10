import { Button, Dimmer, Grid, Header, Placeholder, Segment } from "semantic-ui-react"
import { useDispatch, useSelector } from "react-redux"
import { ReduxState } from "@interfaces/index"
import { useRef } from "react"
import { LoremIpsum } from "lorem-ipsum"
import { toast } from "react-toastify"
import { toastConfig } from "@options/toast"
import { setHintOne, setHintTwo, setHintsUsed } from "@reducers/home"
import axios from "axios"
import Typewriter from "typewriter-effect"
import translations from "@assets/translate.json"
import ImageComponent from "../primary/Image"
import audioFile from "@assets/satc-jingle.m4a"

type Props = {
    callback: () => any
    loading?: boolean
}

const HintsSection = ({ callback = () => null, loading = true }: Props) => {
    const dispatch = useDispatch()
    const hintsUsed = useSelector((state: ReduxState) => state.home.answer.hintsUsed)
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const partTwo = useSelector((state: ReduxState) => state.home.partTwo)
    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]
    const { hintOne, hintTwo } = lang.answer

    const showCharOne = quiz.char.img !== null
    const showCharTwo = partTwo === null ? false : partTwo.char.img

    const audioRef = useRef<HTMLAudioElement>(null)

    const getHint = (quizId: string, number: number) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}quiz/hint/${quizId}`
        axios
            .post(
                url,
                { number },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("bearer")}`
                    }
                }
            )
            .then((response) => {
                dispatch(setHintsUsed({ hintsUsed: hintsUsed + 1 }))
                if (number === 1) {
                    dispatch(setHintOne({ hint: response.data.hint }))
                }
                if (number === 2) {
                    dispatch(setHintTwo({ hint: response.data.hint }))
                }
                if (audioRef.current !== null) {
                    audioRef.current.play()
                }
                const toastMsg = `${hintsUsed === 0 ? "First" : "Second"} hint has been used! -2 point.`
                toast.success(toastMsg, toastConfig)
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const hintCallback = (index: number) => {
        if (isAuth && quiz.id) {
            getHint(quiz.id, index)
            return
        }
        callback()
    }

    const lorem = new LoremIpsum({
        sentencesPerParagraph: {
            max: 8,
            min: 8
        },
        wordsPerSentence: {
            max: 10,
            min: 10
        }
    })

    const img = (pic: string, loading: boolean) => (
        <div className="charPic">
            <Segment circular inverted={inverted} raised>
                {loading ? (
                    <Placeholder inverted={inverted}>
                        <Placeholder.Image />
                    </Placeholder>
                ) : (
                    <ImageComponent circular inverted={inverted} size="small" src={pic} />
                )}
            </Segment>
        </div>
    )

    const hintBox = (
        index: number,
        text: string,
        visible: boolean,
        loading: boolean,
        callback: () => void
    ) => (
        <>
            <Header as="h2" content={text} inverted={inverted} />
            {loading ? (
                <Placeholder fluid inverted={inverted}>
                    <Placeholder.Image style={{ height: "160px" }} />
                </Placeholder>
            ) : (
                <Dimmer.Dimmable
                    as={Segment}
                    blurring
                    className="padded very"
                    dimmed={!visible}
                    inverted={inverted}
                >
                    <Dimmer active={!visible} inverted={inverted}>
                        {!visible && (
                            <Button
                                color={inverted ? "green" : "blue"}
                                content={lang.answer.reveal}
                                inverted={inverted}
                                onClick={callback}
                            />
                        )}
                    </Dimmer>
                    {visible ? (
                        <>
                            {index === 0 && hintsUsed >= 1 && (
                                <Header as="h3" id="hintOne" inverted={inverted}>
                                    <Typewriter
                                        onInit={(typewriter) => {
                                            if (quiz.hintOne === null) {
                                                return
                                            }
                                            typewriter.typeString(quiz.hintOne).start()
                                        }}
                                        options={{ delay: 75 }}
                                    />
                                </Header>
                            )}
                            {index === 1 && hintsUsed === 2 && (
                                <Header as="h3" id="hintTwo" inverted={inverted}>
                                    <Typewriter
                                        onInit={(typewriter) => {
                                            if (quiz.hintTwo === null) {
                                                return
                                            }
                                            typewriter.typeString(quiz.hintTwo).start()
                                        }}
                                        options={{ delay: 75 }}
                                    />
                                </Header>
                            )}
                        </>
                    ) : (
                        <div className="hintPlaceholder">
                            <Header
                                content={lorem.generateSentences(1)}
                                inverted={inverted}
                                size="large"
                            />
                        </div>
                    )}
                </Dimmer.Dimmable>
            )}
        </>
    )

    return (
        <div className="hintsSectionComponent">
            <Segment className="hintsSegment" inverted={inverted} vertical>
                <Grid celled="internally" columns="equal" inverted={inverted} stackable>
                    <Grid.Row>
                        <Grid.Column>
                            {showCharOne && quiz.char.img && img(quiz.char.img, loading)}
                            {hintBox(0, hintOne, hintsUsed >= 1, loading, () => hintCallback(1))}
                        </Grid.Column>
                        <Grid.Column>
                            {showCharTwo && partTwo?.char.img && img(partTwo.char.img, loading)}
                            {hintBox(1, hintTwo, hintsUsed === 2, loading, () => hintCallback(2))}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
            <audio ref={audioRef} src={audioFile} />
        </div>
    )
}

export default HintsSection
