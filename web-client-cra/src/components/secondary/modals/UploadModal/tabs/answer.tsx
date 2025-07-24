import { Button, Divider, Form, Grid, Header, TextArea } from "semantic-ui-react"
import { setLocation, setHint } from "@reducers/form"
import { TranslationBlock } from "@interfaces/translations"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { GeoData, ReduxState } from "@interfaces/index"
import { serialize } from "object-to-formdata"
import { toastConfig } from "@options/toast"
import { toast } from "react-toastify"
import axios from "axios"
import classNames from "classnames"
import LocationInfo from "@components/primary/LocationInfo"
import MapComponent from "@components/primary/Map"
import QuizSearch from "@components/primary/SearchQuiz"
import translations from "@assets/translate.json"

type Props = {
    callback: () => any
    quizVal: string
    quizzesVisible?: boolean
    setQuizVal: (val: string) => any
    setQuizzesVisible: (visible: boolean) => any
}

type CreateQuizPayload = {
    file: string
    videoId: string
    charId: string
    lat: string
    lng: string
    hint: string
    action?: string
    actionId?: number
    partTwo?: string
}

const AnswerTab = ({
    callback,
    quizVal,
    quizzesVisible = false,
    setQuizVal,
    setQuizzesVisible
}: Props) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state: ReduxState) => state.app.user)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang: TranslationBlock = translations[language]

    const action = useSelector((state: ReduxState) => state.form.action)
    const file = useSelector((state: ReduxState) => state.form.file)
    const char = useSelector((state: ReduxState) => state.form.char)
    const video = useSelector((state: ReduxState) => state.form.video)
    const location = useSelector((state: ReduxState) => state.form.location)
    const hint = useSelector((state: ReduxState) => state.form.hint)
    const partTwo = useSelector((state: ReduxState) => state.form.partTwo)
    const { lat, lng } = location

    const [formLoading, setFormLoading] = useState(false)

    const submitQuiz = () => {
        setFormLoading(true)

        const payload: CreateQuizPayload = {
            file: file === null ? "" : file,
            videoId: video.id === null ? "" : `${video.id}`,
            charId: char.id === null ? "" : `${char.id}`,
            lat: lat === null ? "" : `${lat}`,
            lng: lng === null ? "" : `${lng}`,
            hint
        }
        if (partTwo && partTwo.id) {
            payload.partTwo = partTwo.id
        }
        if (action.id !== 0 && action.id) {
            payload.actionId = action.id
        }
        if (action.value !== null) {
            payload.action = action.value
        }

        const url = `${process.env.REACT_APP_API_BASE_URL}quiz/submit`
        axios
            .post(url, serialize(payload), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`,
                    "Content-Type": "multipart/form-data",
                    enctype: "multipart/form-data"
                }
            })
            .then((response) => {
                const quizId = response.data.quiz
                navigate(`/${quizId}`)
                setFormLoading(false)
                callback()
            })
            .catch((error) => {
                let errorMsg = ""
                const { status } = error.response
                const { errors } = error.response.data
                if (status === 401) {
                    errorMsg = error.response.data.message
                } else {
                    if (typeof errors.file !== "undefined") {
                        errorMsg = errors.file[0]
                    }
                    if (typeof errors.videoId !== "undefined") {
                        errorMsg = errors.videoId[0]
                    }
                    if (typeof errors.charId !== "undefined") {
                        errorMsg = errors.charId[0]
                    }
                    if (typeof errors.action !== "undefined") {
                        errorMsg = errors.action[0]
                    }
                    if (typeof errors.actionId !== "undefined") {
                        errorMsg = errors.actionId[0]
                    }
                    if (typeof errors.hint !== "undefined") {
                        errorMsg = errors.hint[0]
                    }
                    if (typeof errors.partTwo !== "undefined") {
                        errorMsg = errors.partTwo[0]
                    }
                }
                setFormLoading(false)
                toast.error(errorMsg, toastConfig)
            })
    }

    const showLocationDetails = (data: GeoData) => dispatch(setLocation(data))

    const hintLimit = 50
    const warning = hintLimit - hint.length < 6
    const error = hintLimit - hint.length === 0

    const lengthClass = classNames({
        hintLength: true,
        warning,
        error,
        inverted
    })
    const maxLimitClass = classNames({
        hintMaxLimit: true,
        warning,
        inverted
    })

    return (
        <>
            <Grid className="answerGrid" columns="equal" inverted={inverted} stackable>
                <Grid.Row>
                    <Grid.Column>
                        <Header className="locationHeader" inverted={inverted} size="medium">
                            <Header.Content>
                                {lang.stepThree.locationHeader}
                                <Header.Subheader>
                                    {lang.stepThree.locationSubHeader}
                                </Header.Subheader>
                            </Header.Content>
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header className="hintHeader" inverted={inverted} size="medium">
                            <Header.Content>
                                {lang.stepThree.hintHeader}
                                <Header.Subheader>
                                    <span className={lengthClass}>{hint.length}</span>/
                                    <span className={maxLimitClass}>{hintLimit}</span>
                                </Header.Subheader>
                            </Header.Content>
                        </Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        {lat && lng && (
                            <MapComponent
                                callback={(data) => showLocationDetails(data)}
                                lat={lat}
                                lng={lng}
                            />
                        )}
                        <LocationInfo answer={location} headerSize="medium" />
                    </Grid.Column>
                    <Grid.Column>
                        <Form size="large">
                            <TextArea
                                inverted={inverted}
                                maxLength={hintLimit}
                                onChange={(e, { value }) => dispatch(setHint({ hint: value }))}
                                placeholder={lang.stepThree.hintPlaceholder}
                                value={hint}
                            />
                        </Form>
                        {user.username === "SATC_Official" && (
                            <>
                                <Header
                                    className="twoPartHeader"
                                    content="Make this a two part quiz"
                                    inverted={inverted}
                                />
                                <QuizSearch
                                    onSelectQuiz={() => setQuizzesVisible(false)}
                                    quizVal={quizVal}
                                    quizzesVisible={quizzesVisible}
                                    setQuizVal={(value: string) => setQuizVal(value)}
                                    setQuizzesVisible={(visible: boolean) =>
                                        setQuizzesVisible(visible)
                                    }
                                />
                            </>
                        )}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Divider inverted={inverted} section />
            <Button
                color={inverted ? "green" : "blue"}
                content={lang.stepThree.submitBtn}
                fluid
                inverted={inverted}
                loading={formLoading}
                onClick={() => submitQuiz()}
                size="big"
            />
        </>
    )
}

export default AnswerTab
