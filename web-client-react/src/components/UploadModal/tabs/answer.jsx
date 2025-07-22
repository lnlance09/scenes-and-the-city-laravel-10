import "../index.scss"
import { Button, Divider, Form, Grid, Header, TextArea } from "semantic-ui-react"
import { clearForm, setLocation, setHint } from "../../../reducers/form"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toastConfig } from "../../../options/toast"
import { toast } from "react-toastify"
import classNames from "classnames"
import LocationInfo from "../../Map/locationInfo"
import MapComponent from "../../Map"
import PropTypes from "prop-types"
import QuizSearch from "../../Search/Quiz"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const AnswerTab = ({
    callback = () => null,
    quizVal = "",
    quizzesVisible = false,
    setQuizVal = () => null,
    setQuizzesVisible = () => null
}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const user = useSelector((state) => state.app.user)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const action = useSelector((state) => state.form.action)
    const file = useSelector((state) => state.form.file)
    const char = useSelector((state) => state.form.char)
    const video = useSelector((state) => state.form.video)
    const location = useSelector((state) => state.form.location)
    const hint = useSelector((state) => state.form.hint)
    const partTwo = useSelector((state) => state.form.partTwo)

    const [formLoading, setFormLoading] = useState(false)

    const submitQuiz = () => {
        setFormLoading(true)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("videoId", video.id)
        formData.append("charId", char.id)
        formData.append("lat", location.lat)
        formData.append("lng", location.lng)
        formData.append("hint", hint)

        if (partTwo) {
            formData.set("partTwo", partTwo.id)
        }

        if (action.id !== 0) {
            formData.append("actionId", action.id)
        }

        if (action.value !== null) {
            formData.append("action", action.value)
        }

        fetch(`${apiBaseUrl}quiz/submit`, {
            method: "POST",
            body: formData,
            mode: "cors",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`,
                "Content-Type": "multipart/form-data",
                enctype: "multipart/form-data"
            }
        })
            .then((response) => {
                if (!response.ok) {
                    console.error("response is not okay")
                }
                response.json()
            })
            .then((response) => {
                const quizId = response.quiz
                dispatch(clearForm())
                setFormLoading(false)
                setQuizVal("")
                setQuizzesVisible(false)
                callback()
                navigate(`/${quizId}`)
            })
            .catch((error) => {
                console.error("error2", error)
                toast.error(error, {
                    ...toastConfig,
                    className: inverted ? "inverted" : null
                })
                setFormLoading(false)
            })
    }

    const showLocationDetails = (data) => {
        dispatch(
            setLocation({
                lat: data.lat,
                lng: data.lng,
                hood: data.hood,
                borough: data.borough,
                streets: data.streets
            })
        )
    }

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
                        <Header className="locationHeader" inverted={inverted}>
                            <Header.Content>
                                {lang.form.steps[2].locationHeader}
                                <Header.Subheader>
                                    {lang.form.steps[2].locationSubHeader}
                                </Header.Subheader>
                            </Header.Content>
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <Header className="hintHeader" inverted={inverted}>
                            <Header.Content>
                                {lang.form.steps[2].hintHeader}
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
                        <MapComponent
                            callback={(data) => showLocationDetails(data)}
                            lat={location.lat}
                            lng={location.lng}
                        />
                        {location.hood !== null && <LocationInfo answer={location} size="small" />}
                    </Grid.Column>
                    <Grid.Column>
                        <Form size="large">
                            <TextArea
                                inverted={inverted}
                                maxLength={hintLimit}
                                onChange={(e, { value }) => dispatch(setHint({ hint: value }))}
                                placeholder={lang.form.steps[2].hintPlaceholder}
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
                                    setQuizVal={(value) => setQuizVal(value)}
                                    setQuizzesVisible={(visible) => setQuizzesVisible(visible)}
                                />
                            </>
                        )}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Divider inverted={inverted} />
            <Button
                color={inverted ? "green" : "blue"}
                content={lang.form.steps[2].submitBtn}
                fluid
                inverted={inverted}
                loading={formLoading}
                onClick={() => submitQuiz()}
                size="large"
            />
        </>
    )
}

AnswerTab.propTypes = {
    callback: PropTypes.func,
    quizVal: PropTypes.string,
    quizzesVisible: PropTypes.bool,
    setQuizVal: PropTypes.func,
    setQuizzesVisible: PropTypes.func
}

export default AnswerTab
