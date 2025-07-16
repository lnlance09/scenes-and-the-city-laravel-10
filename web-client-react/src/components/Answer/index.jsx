import "./index.scss"
import { Button, Container, Divider, Header, Label, Placeholder, Segment } from "semantic-ui-react"
import { useTimer } from "react-timer-hook"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { setAnswerGeoData, setHasAnswered } from "../../reducers/home"
import { formatMargin, formatPlural, timeout, typeWriterEffect } from "../../utils/general"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import { dateFormat, nyc } from "../../utils/date"
import axios from "axios"
import giphy from "../../images/regis-philbin.gif"
import FlashScreen from "../FlashScreen"
import LocationInfo from "../Map/locationInfo"
import MapComponent from "../Map"
import moment from "moment-timezone"
import ModalComponent from "../Header/modals/modal"
import PropTypes from "prop-types"
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
    const units = useSelector((state) => state.app.units)
    const quiz = useSelector((state) => state.home.quiz)
    const answer = useSelector((state) => state.home.answer)
    const isAuth = useSelector((state) => state.app.auth)
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
        if (modalVisible) {
            typeWriterEffect("typeMessage", lang.main.finalAnswerHeader, () => {
                setFormDisabled(false)
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalVisible])

    const { seconds, minutes, hours } = useTimer({
        expiryTimestamp: moment(expirationDate).tz(nyc).toDate(),
        interval: 1000,
        onExpire: () => console.warn("onExpire called")
    })
    const secs = `${seconds}`.padStart(1, "0")
    const mins = `${minutes}`.padStart(1, "0")
    const hoursLeft = `${hours}`.padStart(1, "0")

    const submitAnswer = () => {
        axios
            .post(
                `${apiBaseUrl}quiz/answer/${quiz.id}`,
                { lat: answer.geoData.lat, lng: geoData.lng },
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
            setAnswerGeoData({
                geoData: {
                    lat: data.lat,
                    lng: data.lng,
                    hood: data.hood,
                    borough: data.borough,
                    streets: data.streets
                }
            })
        )
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
                                    {language === "es"
                                        ? lang.main.away.replace(
                                              "{distance}",
                                              `${formatMargin(answer.marginOfError, units).toPrecision(3)} ${units === "kilometers" ? "km" : "mi"}`
                                          )
                                        : `${formatMargin(answer.marginOfError, units).toPrecision(3)} ${units === "kilometers" ? "km" : "mi"} ${lang.main.away}`}
                                    {answer.correct && (
                                        <Header.Subheader>
                                            +{10 - answer.hintsUsed * 2} {lang.answer.points} 🥳
                                        </Header.Subheader>
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
                            {quiz.geoData && <LocationInfo answer={quiz.geoData} />}
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
                                    color={inverted ? "green" : "blue"}
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
                    <Header as="p" id="typeMessage" size="large" textAlign="center" />
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
                            onClick={() => {
                                submitAnswer()
                            }}
                        />
                    </Button.Group>
                </Segment>
            </ModalComponent>

            <FlashScreen open={flashOpen} text={lang.answer.successMsg} />
        </div>
    )
}

AnswerSection.propTypes = {
    callback: PropTypes.func,
    date: PropTypes.string,
    loading: PropTypes.bool
}

export default AnswerSection
