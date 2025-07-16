import "./index.scss"
import { Button, Dimmer, Grid, Header, Image, Placeholder, Segment } from "semantic-ui-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { LoremIpsum } from "lorem-ipsum"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import { typeWriterEffect } from "../../utils/general"
import { setHintOne, setHintTwo, setHintsUsed } from "../../reducers/home"
import axios from "axios"
import PropTypes from "prop-types"
import NotFoundSvg from "../../images/not-found.svg"
import NotFoundSvgInverted from "../../images/not-found-inverted.svg"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const HintsSection = ({ callback = () => null, loading = true }) => {
    const dispatch = useDispatch()

    const hintsUsed = useSelector((state) => state.home.answer.hintsUsed)
    const quiz = useSelector((state) => state.home.quiz)
    const partTwo = useSelector((state) => state.home.partTwo)
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const { hintOne, hintTwo } = lang.answer

    const showCharOne = quiz.char.img !== null
    const showCharTwo = partTwo === null ? false : partTwo.char.img
    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg

    useEffect(() => {
        if (loading) {
            return
        }
        if (hintsUsed >= 1) {
            typeWriterEffect("hintOne", quiz.hintOne)
        }
        if (hintsUsed === 2) {
            typeWriterEffect("hintTwo", quiz.hintTwo)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hintsUsed, loading])

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
                }
                if (number === 2) {
                    dispatch(setHintTwo({ hint: response.data.hint }))
                }
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const hintCallback = (index) => {
        if (isAuth) {
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

    const img = (pic, loading) => (
        <div className="charPic">
            <Segment circular inverted={inverted} raised>
                {loading ? (
                    <Placeholder inverted={inverted}>
                        <Placeholder.Image />
                    </Placeholder>
                ) : (
                    <Image
                        circular
                        onError={(i) => (i.target.src = notFoundImg)}
                        size="small"
                        src={pic}
                    />
                )}
            </Segment>
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
                            {showCharOne && img(quiz.char.img, loading)}
                            {hintBox(0, hintOne, hintsUsed >= 1, loading, () => hintCallback(1))}
                        </Grid.Column>
                        <Grid.Column>
                            {showCharTwo && img(partTwo.char.img, loading)}
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
