import "./index.scss"
import { Button, Dimmer, Grid, Header, Image, Placeholder, Segment } from "semantic-ui-react"
import { useDispatch, useSelector } from "react-redux"
import { LoremIpsum } from "lorem-ipsum"
import { Typewriter } from "typewriter-effect/dist/core"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import { setHintOne, setHintTwo, setHintsUsed } from "../../reducers/home"
import axios from "axios"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"
import { useEffect } from "react"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const HintsSection = ({ callback = () => null, loading = true }) => {
    const dispatch = useDispatch()

    const hintsUsed = useSelector((state) => state.home.answer.hintsUsed)
    const quiz = useSelector((state) => state.home.quiz)
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const { hintOne, hintTwo } = lang.answer

    useEffect(() => {
        if (loading) {
            return
        }
        if (quiz.hintUsed === 1) {
            startTyping("hintOne")
        }
        if (quiz.hintUsed === 2) {
            startTyping("hintTwo")
        }
    }, [loading])

    const getHint = (quizId, number) => {
        axios
            .post(
                `${apiBaseUrl}quiz/hint/${quizId}`,
                {
                    number
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("bearer")}`
                    }
                }
            )
            .then((response) => {
                const toastMsg = `${hintsUsed === 0 ? "First" : "Second"} hint has been used!`
                dispatch(setHintsUsed({ amount: hintsUsed + 1 }))
                if (number === 1) {
                    dispatch(setHintOne({ hint: response.data.hint }))
                    startTyping("hintOne")
                }
                if (number === 2) {
                    dispatch(setHintTwo({ hint: response.data.hint }))
                    startTyping("hintTwo")
                }
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const hintCallback = (index) => {
        if (isAuth) {
            getHint(quiz.quizId, index)
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

    const startTyping = (id) => {
        const header = document.getElementById(id)
        const typewriter = new Typewriter(header, {
            delay: 75
        })
        const text = id === "hintOne" ? quiz.hintOne : quiz.hintTwo
        typewriter.typeString(text).start()
    }

    const img = (loading) => (
        <div className="charPic">
            {loading ? (
                <Placeholder inverted={inverted}>
                    <Placeholder.Image style={{ borderRadius: "50%", height: 160, width: 160 }} />
                </Placeholder>
            ) : (
                <Image
                    circular
                    size="small"
                    src="https://i.scdn.co/image/ab67616d00001e021c29620d79497da6dc08f7da"
                />
            )}
        </div>
    )

    const hintBox = (index, text, visible, loading, callback) => (
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
                            {index === 0 && <Header as="h3" id="hintOne" inverted={inverted} />}
                            {index === 1 && <Header as="h3" id="hintTwo" inverted={inverted} />}
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
                            {/* img(loading) */}
                            {hintBox(0, hintOne, hintsUsed >= 1, loading, () => hintCallback(1))}
                        </Grid.Column>
                        <Grid.Column>
                            {/* img(loading) */}
                            {hintBox(1, hintTwo, hintsUsed === 2, loading, () => hintCallback(2))}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </div>
    )
}

HintsSection.propTypes = {
    callback: PropTypes.func,
    loading: PropTypes.bool
}

export default HintsSection
