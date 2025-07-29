import {
    Button,
    Container,
    Divider,
    Header,
    Label,
    Menu,
    Placeholder,
    Segment
} from "semantic-ui-react"
import { useDispatch, useSelector } from "react-redux"
import { Reducer, useEffect, useReducer, useState } from "react"
import { setAnswerGeoData, setHasAnswered } from "@reducers/home"
import { formatMargin, timeout } from "@utils/general"
import { GeoData, LocationPoint, Nullable, Quiz, ReduxState } from "@interfaces/index"
import { toast } from "react-toastify"
import { toastConfig } from "@options/toast"
import { dateFormat, nyc } from "@utils/date"
import { DateTime } from "luxon"
import axios from "axios"
import FinalAnswerModal from "./modals/FinalAnswerModal"
import FlashScreen from "../primary/FlashScreen"
import LocationInfo from "../primary/LocationInfo"
import MapComponent, { MarkerProps } from "../primary/Map"
import translations from "@assets/translate.json"

type Props = {
    callback: () => any
    date: string
    loading?: boolean
}

type AnswerState = {
    markers: MarkerProps[]
    markersPartTwo: MarkerProps[]
}

type AnswerActionType =
    | "SET_MARKER"
    | "CLEAR_MARKERS"
    | "CLEAR_MARKERS_PART_TWO"
    | "SET_MARKER_PART_TWO"

export type AnswerAction = {
    type: AnswerActionType
    payload?: MarkerProps
}

export const initialAnswerState: AnswerState = {
    markers: [],
    markersPartTwo: []
}

export const reducer: Reducer<AnswerState, AnswerAction> = (state, action) => {
    switch (action.type) {
        case "CLEAR_MARKERS":
            return {
                ...state,
                markers: []
            }
        case "CLEAR_MARKERS_PART_TWO":
            return {
                ...state,
                markersPartTwo: []
            }
        case "SET_MARKER":
            return {
                ...state,
                markers: action?.payload ? [...state.markers, action.payload] : [...state.markers]
            }
        case "SET_MARKER_PART_TWO":
            return {
                ...state,
                markersPartTwo: action?.payload
                    ? [...state.markersPartTwo, action.payload]
                    : [...state.markersPartTwo]
            }
        default:
            throw new Error()
    }
}

type SubmitPayload = {
    answer: LocationPoint
    partTwo?: LocationPoint
}

const AnswerSection = ({ callback, date, loading = true }: Props) => {
    const dispatch = useDispatch()
    const [internalState, dispatchInternal] = useReducer(reducer, initialAnswerState)

    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const units = useSelector((state: ReduxState) => state.app.units)
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const partTwo = useSelector((state: ReduxState) => state.home.partTwo)
    const answers = useSelector((state: ReduxState) => state.home.answers)
    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const lang = translations[language]

    const answer = answers[0]
    const answerPartTwo = answers.length === 2 ? answers[1] : undefined
    const { correct, hasAnswered, hintsUsed, marginOfError } = answer

    const [activeItem, setActiveItem] = useState(1)
    const [flashOpen, setFlashOpen] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [formDisabled, setFormDisabled] = useState(true)

    const dt = DateTime.fromFormat(date, dateFormat).setZone(nyc)
    const expiry = dt.plus({ days: 1 }).startOf("day").toRelative()
    const isToday = dt.hasSame(DateTime.local(), "day")
    const canSubmit = isToday && !hasAnswered
    const displayForm = isToday || hasAnswered
    const revealAnswer = quiz.geoData !== null
    const abbrev = units === "kilometers" ? "km" : "mi"
    const formattedMargin = marginOfError ? formatMargin(marginOfError, units).toPrecision(3) : 0

    useEffect(() => {
        dispatchInternal({ type: "CLEAR_MARKERS" })
        dispatchInternal({
            type: "SET_MARKER",
            payload: {
                callback: (data: GeoData) => {
                    showLocationDetails(data, 0)
                    setActiveItem(1)
                },
                draggable: !hasAnswered,
                lat: answer.geoData.lat ? answer.geoData.lat : 40.758896,
                lng: answer.geoData.lng ? answer.geoData.lng : -73.98513,
                text: quiz.char.firstName
            }
        })
        if (answerPartTwo !== undefined) {
            dispatchInternal({ type: "CLEAR_MARKERS_PART_TWO" })
            dispatchInternal({
                type: "SET_MARKER_PART_TWO",
                payload: {
                    callback: (data: GeoData) => {
                        showLocationDetails(data, 1)
                        setActiveItem(2)
                    },
                    draggable: !hasAnswered,
                    lat: answerPartTwo.geoData.lat ? answerPartTwo.geoData.lat : 40.758896,
                    lng: answerPartTwo.geoData.lng ? answerPartTwo.geoData.lng : -73.98513,
                    text: partTwo?.char.firstName
                }
            })
        }

        if (!hasAnswered) {
            return
        }
        // These won't be returned from the API until the day after the quiz has been created
        // See the Quiz resource
        if (quiz.geoData === null) {
            return
        }
        if (quiz.geoData.lat === null || quiz.geoData.lng === null) {
            return
        }
        dispatchInternal({
            type: "SET_MARKER",
            payload: {
                callback: () => null,
                draggable: false,
                lat: quiz.geoData?.lat,
                lng: quiz.geoData?.lng,
                text: `${quiz.char.firstName}'s Actual Location`
            }
        })

        if (partTwo === null) {
            return
        }
        if (partTwo.geoData === null) {
            return
        }
        if (partTwo.geoData.lat === null || partTwo.geoData.lng === null) {
            return
        }
        dispatchInternal({
            type: "SET_MARKER_PART_TWO",
            payload: {
                callback: () => null,
                draggable: false,
                lat: partTwo.geoData?.lat,
                lng: partTwo.geoData?.lng,
                text: `${partTwo?.char.firstName}'s Actual Location`
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answer, answerPartTwo])

    const showLocationDetails = (geoData: GeoData, index: 0 | 1) =>
        dispatch(setAnswerGeoData({ geoData, index }))

    const submitAnswer = (data: GeoData, partTwo?: GeoData) => {
        const { lat, lng } = data
        if (lat === null || lng === null) {
            return
        }
        const formData: SubmitPayload = { answer: { lat, lng } }
        if (partTwo && partTwo.lat && partTwo.lng) {
            formData.partTwo = { lat: partTwo.lat, lng: partTwo.lng }
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
                dispatch(setHasAnswered({ hasAnswered: true, index: 0 }))
                setModalVisible(false)
                setFormDisabled(false)
                setFlashOpen(false)
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const myAnswer = (
        correct: Nullable<number>,
        hintsUsed: number,
        marginOfError: Nullable<number>,
        geoData: GeoData
    ) => (
        <>
            <Header
                className="myAnswerHeader"
                content={lang.answer.myGuess}
                inverted={inverted}
                size="large"
            />
            <LocationInfo answer={geoData} />
            {!isToday && marginOfError !== null && correct !== null && (
                <Segment color={inverted ? "green" : "blue"} inverted placeholder>
                    <Header className="myAnswerHeader" inverted size="huge" textAlign="center">
                        <Header.Content>
                            {language === "es"
                                ? lang.main.away.replace(
                                      "{distance}",
                                      `${formattedMargin} ${abbrev}`
                                  )
                                : `${formattedMargin} ${abbrev} ${lang.main.away}`}
                            {correct > 0 && (
                                <Header.Subheader>
                                    {`+${10 - hintsUsed * 2} ${lang.answer.points} 🥳`}
                                </Header.Subheader>
                            )}
                        </Header.Content>
                    </Header>
                </Segment>
            )}
        </>
    )

    const statusLabel = (
        <>
            <Divider hidden />
            {!isToday && answer.correct !== null ? (
                <Label
                    basic={!inverted}
                    ribbon="right"
                    color={answer.correct ? (inverted ? "green" : "blue") : "red"}
                    size="large"
                >
                    <i>{answer.correct ? lang.answer.correct : lang.answer.incorrect}!</i>
                </Label>
            ) : (
                <Label
                    basic={!inverted}
                    ribbon="right"
                    color={inverted ? "green" : "blue"}
                    size="large"
                >
                    <i>Pending</i>
                </Label>
            )}
        </>
    )

    const submissionHeader = (
        <Header as="h2" attached="top" inverted={inverted} size="huge" textAlign="center">
            <Header.Content>{lang.answer.title}</Header.Content>
            <Header.Subheader>expires {expiry}</Header.Subheader>
        </Header>
    )

    const partTwoMenu = (partTwo: Quiz) => (
        <Menu inverted={inverted} pointing secondary size="huge">
            <Menu.Item active={activeItem === 1} onClick={() => setActiveItem(1)}>
                {quiz.char.firstName}
            </Menu.Item>
            <Menu.Item active={activeItem === 2} onClick={() => setActiveItem(2)}>
                {partTwo.char.firstName}
            </Menu.Item>
        </Menu>
    )

    const submitBtn = (
        <Button
            className="submitQuizBtn"
            color={inverted ? "green" : "blue"}
            content={lang.answer.submit}
            disabled={hasAnswered && answer.geoData.hood !== null}
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
    )

    const fullForm = (
        <>
            {canSubmit && <>{submissionHeader}</>}
            <Segment
                attached={canSubmit}
                className="segmentForm"
                inverted={inverted}
                secondary={!inverted}
                stacked
            >
                {activeItem === 1 &&
                    answer.geoData.lat !== null &&
                    answer.geoData?.lng !== null && (
                        <>
                            <MapComponent
                                lat={answer.geoData.lat}
                                lng={answer.geoData.lng}
                                markers={internalState.markers}
                            />
                            {!hasAnswered && (
                                <LocationInfo answer={answer.geoData} headerSize="medium" />
                            )}
                        </>
                    )}
                {activeItem === 2 &&
                    answerPartTwo !== undefined &&
                    answerPartTwo.geoData.lat !== null &&
                    answerPartTwo.geoData?.lng !== null && (
                        <>
                            <MapComponent
                                lat={answerPartTwo.geoData.lat}
                                lng={answerPartTwo.geoData.lng}
                                markers={internalState.markersPartTwo}
                            />
                            {!hasAnswered && (
                                <LocationInfo answer={answerPartTwo.geoData} headerSize="medium" />
                            )}
                        </>
                    )}
                {hasAnswered && <>{statusLabel}</>}
                {partTwo && <>{partTwoMenu(partTwo)}</>}
                {hasAnswered && (
                    <Segment inverted={inverted}>
                        {activeItem === 1 && (
                            <>
                                {myAnswer(correct, hintsUsed, marginOfError, answer.geoData)}
                                {revealAnswer && (
                                    <>
                                        <Header
                                            className="myAnswerHeader"
                                            content={lang.answer.actualAnswer}
                                            inverted={inverted}
                                            size="large"
                                        />
                                        {quiz.geoData && (
                                            <LocationInfo
                                                answer={quiz.geoData}
                                                headerSize="medium"
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                        {activeItem === 2 && answerPartTwo && (
                            <>
                                {myAnswer(
                                    answerPartTwo.correct,
                                    answerPartTwo.hintsUsed,
                                    answerPartTwo.marginOfError,
                                    answerPartTwo.geoData
                                )}
                                {revealAnswer && (
                                    <>
                                        <Header
                                            className="myAnswerHeader"
                                            content={lang.answer.actualAnswer}
                                            inverted={inverted}
                                            size="large"
                                        />
                                        {partTwo?.geoData && (
                                            <LocationInfo
                                                answer={partTwo?.geoData}
                                                headerSize="medium"
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </Segment>
                )}
                {canSubmit && <>{submitBtn}</>}
            </Segment>
        </>
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
                            {!displayForm ? (
                                <Header
                                    as="h2"
                                    className="expiredHeader"
                                    content={lang.main.expiredMsg}
                                    inverted={inverted}
                                    textAlign="center"
                                    size="large"
                                />
                            ) : (
                                <>{fullForm}</>
                            )}
                        </>
                    )}
                </Container>
            </Segment>

            <FinalAnswerModal
                callback={async () => {
                    submitAnswer(answer.geoData, answerPartTwo?.geoData)
                }}
                formDisabled={formDisabled}
                setFormDisabled={(disabled) => setFormDisabled(disabled)}
                setVisible={(visible) => setModalVisible(visible)}
                visible={modalVisible}
            />
            <FlashScreen clip="jingle" open={flashOpen} text={lang.answer.successMsg} />
        </div>
    )
}

export default AnswerSection
