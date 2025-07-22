import { Button, Container, Divider, Header, Label, Placeholder, Segment } from "semantic-ui-react"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { setAnswerGeoData, setHasAnswered } from "@reducers/home"
import { formatMargin, formatPlural, timeout } from "@utils/general"
import { GeoData, LocationPoint, ReduxState } from "@interfaces/index"
import { useTimer } from "react-timer-hook"
import { toast } from "react-toastify"
import { toastConfig } from "@options/toast"
import { dateFormat, nyc } from "@utils/date"
import axios from "axios"
import giphy from "@images/regis-philbin.gif"
import FlashScreen from "../primary/FlashScreen"
import LocationInfo from "../primary/LocationInfo"
import MapComponent from "../primary/Map"
import moment from "moment-timezone"
import ModalComponent from "../primary/Modal"
import Typewriter from "typewriter-effect"
import translations from "@assets/translate.json"

type Props = {
    callback: () => any
    date: string
    loading?: boolean
}

const AnswerSection = ({
    callback,
    date = moment().tz(nyc).format(dateFormat),
    loading = true
}: Props) => {
    const dispatch = useDispatch()

    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const units = useSelector((state: ReduxState) => state.app.units)
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const answer = useSelector((state: ReduxState) => state.home.answer)
    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const lang = translations[language]
    const { hour, minute, second } = lang.time

    const { geoData, hasAnswered } = answer
    const [flashOpen, setFlashOpen] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [formDisabled, setFormDisabled] = useState(true)

    const expirationDate = moment(date).tz(nyc).add(1, "days").startOf("day").toDate()
    const isToday = moment(date).tz(nyc).isSameOrAfter(moment().subtract(1, "days"))
    const canSubmit = isToday && !hasAnswered
    const displayForm = isToday || hasAnswered
    const revealAnswer = quiz.geoData !== null

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalVisible])

    const { seconds, minutes, hours } = useTimer({
        expiryTimestamp: moment(expirationDate).tz(nyc).toDate(),
        interval: 1000,
        onExpire: () => console.warn("onExpire called")
    })
    const secs = parseInt(`${seconds}`.padStart(1, "0"), 10)
    const mins = parseInt(`${minutes}`.padStart(1, "0"), 10)
    const hoursLeft = parseInt(`${hours}`.padStart(1, "0"), 10)

    const submitAnswer = () => {
        if (geoData.lat === null || geoData.lng === null) {
            return
        }
        const formData: LocationPoint = {
            lat: geoData.lat,
            lng: geoData.lng
        }
        const url = `${process.env.REACT_APP_API_BASE_URL}quiz/answer/${quiz.id}`
        axios
            .post(url, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
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

    const showLocationDetails = (data: GeoData) => {
        dispatch(setAnswerGeoData({ geoData: data }))
    }

    const mapForm = (
        <Segment inverted={inverted} secondary={!inverted} stacked>
            {geoData.lat !== null && geoData.lng !== null && (
                <MapComponent
                    callback={(data) => showLocationDetails(data)}
                    draggable={!hasAnswered}
                    lat={geoData.lat}
                    lng={geoData.lng}
                />
            )}
            {hasAnswered && (
                <>
                    {!isToday && (
                        <>
                            <Divider hidden />
                            <Label
                                basic={!inverted}
                                ribbon="right"
                                color={answer.correct ? (inverted ? "green" : "blue") : "red"}
                                size="large"
                            >
                                <i>
                                    {answer.correct ? lang.answer.correct : lang.answer.incorrect}!
                                </i>
                            </Label>
                        </>
                    )}
                    <Header
                        className="myAnswerHeader"
                        content={lang.answer.myGuess}
                        inverted={inverted}
                        size="large"
                    />
                    {geoData !== null && <LocationInfo answer={geoData} />}
                    {!isToday && (
                        <Segment color={inverted ? "green" : "blue"} inverted placeholder>
                            <Header
                                className="myAnswerHeader"
                                inverted
                                size="huge"
                                textAlign="center"
                            >
                                <Header.Content>
                                    {answer.marginOfError !== null && (
                                        <>
                                            {language === "es"
                                                ? lang.main.away.replace(
                                                      "{distance}",
                                                      `${formatMargin(answer.marginOfError, units).toPrecision(3)} ${units === "kilometers" ? "km" : "mi"}`
                                                  )
                                                : `${formatMargin(answer.marginOfError, units).toPrecision(3)} ${units === "kilometers" ? "km" : "mi"} ${lang.main.away}`}
                                            {answer.correct && (
                                                <Header.Subheader>
                                                    +{10 - answer.hintsUsed * 2}{" "}
                                                    {lang.answer.points} 🥳
                                                </Header.Subheader>
                                            )}
                                        </>
                                    )}
                                </Header.Content>
                            </Header>
                        </Segment>
                    )}
                    {revealAnswer && (
                        <>
                            <Header
                                className="myAnswerHeader"
                                content={lang.answer.actualAnswer}
                                inverted={inverted}
                                size="large"
                            />
                            {quiz.geoData && (
                                <LocationInfo answer={quiz.geoData} headerSize="medium" />
                            )}
                        </>
                    )}
                </>
            )}
        </Segment>
    )

    return (
        <div className="answersSectionComponent">
            <Segment className="answersSegment" inverted={inverted} vertical>
                <Container text>
                    {loading ? (
                        <Placeholder fluid inverted={inverted} style={{ height: "300px" }}>
                            <Placeholder.Image />
                        </Placeholder>
                    ) : (
                        <>
                            {canSubmit && (
                                <Header as="h2" inverted={inverted} textAlign="center">
                                    <Header.Content>{lang.answer.title}</Header.Content>
                                    <Header.Subheader>
                                        {`${hoursLeft} ${formatPlural(hoursLeft, hour)} ${mins} ${formatPlural(mins, minute)} ${secs} ${formatPlural(secs, second)}`}
                                    </Header.Subheader>
                                </Header>
                            )}
                            {!displayForm && (
                                <Header
                                    as="h2"
                                    className="expiredHeader"
                                    content={lang.main.expiredMsg}
                                    inverted={inverted}
                                    textAlign="center"
                                />
                            )}
                            {displayForm && mapForm}
                            {canSubmit && (
                                <Button
                                    className="submitQuizBtn"
                                    color={inverted ? "green" : "black"}
                                    content={lang.answer.submit}
                                    disabled={hasAnswered && geoData.hood !== null}
                                    fluid
                                    inverted={inverted}
                                    onClick={() => {
                                        if (isAuth) {
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
                className={{ finalAnswerModal: true }}
                callback={() => {
                    setModalVisible(false)
                    setFormDisabled(true)
                }}
                open={modalVisible}
                size="small"
            >
                <Segment basic={!inverted} fluid inverted={inverted}>
                    <img
                        alt="Is that your final answer?"
                        className="ui image fluid rounded bordered centered"
                        src={giphy}
                    />
                    <Header as="p" id="typeMessage" size="large" textAlign="center">
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter
                                    .typeString(lang.main.finalAnswerHeader)
                                    .start()
                                    .callFunction(() => setFormDisabled(false))
                            }}
                            options={{ delay: 75 }}
                        />
                    </Header>
                    <Divider hidden />
                    <Button.Group fluid size="large" widths="eight">
                        <Button
                            color="red"
                            content={lang.main.finalAnswerDeny}
                            inverted={inverted}
                            disabled={formDisabled}
                            onClick={() => setModalVisible(false)}
                        />
                        <Button
                            color={inverted ? "green" : "blue"}
                            content={lang.main.finalAnswerConfirm}
                            inverted={inverted}
                            disabled={formDisabled}
                            onClick={() => submitAnswer()}
                        />
                    </Button.Group>
                </Segment>
            </ModalComponent>
            <FlashScreen clip="jingle" open={flashOpen} text={lang.answer.successMsg} />
        </div>
    )
}

export default AnswerSection
