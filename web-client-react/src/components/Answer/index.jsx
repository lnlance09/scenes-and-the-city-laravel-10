import "./index.scss"
import { Button, Container, Divider, Header, Modal, Placeholder, Segment } from "semantic-ui-react"
import { useTimer } from "react-timer-hook"
import { useDispatch, useSelector } from "react-redux"
import { useState } from "react"
import { Typewriter } from "typewriter-effect/dist/core"
import { setAnswer, setHasAnswered } from "../../reducers/home"
import { formatPlural, timeout } from "../../utils/general"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import { dateFormat, nyc } from "../../utils/date"
import axios from "axios"
import FlashScreen from "../FlashScreen"
import LocationInfo from "../Map/locationInfo"
import MapComponent from "../Map"
import ModalComponent from "../Header/modals/modal"
import PropTypes from "prop-types"
import moment from "moment-timezone"
import giphy from "../../images/regis-philbin.gif"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const AnswerSection = ({
    callback = () => null,
    date = moment().tz(nyc).format(dateFormat),
    loading = true
}) => {
    const dispatch = useDispatch()

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const quizId = useSelector((state) => state.home.quiz.quizId)
    const answer = useSelector((state) => state.home.answer)
    const hasAnswered = useSelector((state) => state.home.hasAnswered)
    const isAuth = useSelector((state) => state.app.auth)
    const lang = translations[language]

    const [flashOpen, setFlashOpen] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [formDisabled, setFormDisabled] = useState(true)

    const expirationDate = moment(date).tz(nyc).add(1, "days").startOf("day").toDate()
    const isToday = moment(date).tz(nyc).isSameOrAfter(moment().subtract(1, "days"))

    const submitAnswer = () => {
        axios
            .post(
                `${apiBaseUrl}quiz/answer/${quizId}`,
                { lat: answer.lat, lng: answer.lng },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("bearer")}`
                    }
                }
            )
            .then(async () => {
                setFlashOpen(true)
                await timeout(9000)
                dispatch(setHasAnswered({ hasAnswered: true }))
                setModalVisible(false)
                setFormDisabled(false)
                setFlashOpen(false)
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const showLocationDetails = (data) => {
        dispatch(
            setAnswer({
                lat: data.lat,
                lng: data.lng,
                hood: data.hood,
                borough: data.borough,
                streets: data.streets
            })
        )
    }

    const startTyping = () => {
        const header = document.getElementById("typeMessage")
        const typewriter = new Typewriter(header, {
            delay: 75
        })
        typewriter.typeString("You won't lose anything for guessing incorrectly").start()
    }

    const { seconds, minutes, hours } = useTimer({
        expiryTimestamp: moment(expirationDate).tz(nyc).toDate(),
        interval: 1000,
        onExpire: () => console.warn("onExpire called")
    })
    const secs = `${seconds}`.padStart(1, "0")
    const mins = `${minutes}`.padStart(1, "0")
    const hoursLeft = `${hours}`.padStart(1, "0")

    return (
        <div className="answersSectionComponent">
            <Segment className="answersSegment" inverted={inverted} vertical>
                <Container text>
                    {loading ? (
                        <Segment basic={!inverted} fluid inverted={inverted}>
                            <Placeholder fluid inverted={inverted}>
                                <Placeholder.Header>
                                    <Placeholder.Line length="very long" />
                                    <Placeholder.Line length="very long" />
                                </Placeholder.Header>
                            </Placeholder>
                        </Segment>
                    ) : (
                        <>
                            <Header as="h2" inverted={inverted} textAlign="center">
                                {isToday && !hasAnswered && (
                                    <>
                                        <Header.Content>{lang.answer.title}</Header.Content>
                                        <Header.Subheader>
                                            {`${hoursLeft} ${formatPlural(hoursLeft, lang.time.hour)} ${mins} ${formatPlural(mins, lang.time.minute)} ${secs} ${formatPlural(secs, lang.time.second)}`}
                                        </Header.Subheader>
                                    </>
                                )}
                                {!isToday && !hasAnswered && (
                                    <Header.Content>This quiz has expired</Header.Content>
                                )}
                            </Header>
                            {(isToday || hasAnswered) && (
                                <>
                                    {answer.lat !== null && answer.lng !== null && (
                                        <MapComponent
                                            callback={(data) => showLocationDetails(data)}
                                            draggable={!hasAnswered}
                                            lat={answer.lat}
                                            lng={answer.lng}
                                        />
                                    )}
                                    {answer.hood !== null && <LocationInfo answer={answer} />}
                                </>
                            )}
                            {isToday && (
                                <Button
                                    className="submitQuizBtn"
                                    color={inverted ? "green" : "blue"}
                                    content={lang.answer.submit}
                                    disabled={hasAnswered && answer.hood !== null}
                                    fluid
                                    inverted={inverted}
                                    onClick={() => {
                                        if (isAuth) {
                                            startTyping()
                                            setModalVisible(true)
                                            return
                                        }
                                        callback()
                                    }}
                                    size="big"
                                />
                            )}
                        </>
                    )}
                </Container>
            </Segment>

            <ModalComponent
                basic
                className={{ finalAnswerModal: true }}
                callback={() => {
                    setModalVisible(false)
                    setFormDisabled(true)
                }}
                open={modalVisible}
                size="small"
            >
                <>
                    <Segment basic={!inverted} fluid inverted={inverted}>
                        <img
                            alt="Is that your final answer?"
                            className="ui image fluid rounded bordered centered"
                            src={giphy}
                        />
                        <Header as="p" id="typeMessage" inverted size="large" textAlign="center" />
                        <Divider hidden />
                        <Button.Group fluid size="large" widths="eight">
                            <Button
                                color="red"
                                content="Let me think some more."
                                inverted={inverted}
                                disabled={formDisabled}
                                onClick={() => setModalVisible(false)}
                            />
                            <Button
                                color={inverted ? "green" : "blue"}
                                content="Yep, that's correct"
                                inverted={inverted}
                                disabled={formDisabled}
                                onClick={() => {
                                    submitAnswer()
                                }}
                            />
                        </Button.Group>
                    </Segment>
                </>
            </ModalComponent>

            <FlashScreen open={flashOpen} text="Your answer has been recorded" />
        </div>
    )
}

AnswerSection.propTypes = {
    callback: PropTypes.func,
    date: PropTypes.string,
    loading: PropTypes.bool
}

export default AnswerSection
