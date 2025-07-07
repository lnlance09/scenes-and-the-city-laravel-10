import "./index.scss"
import { Button, Divider, Form, Grid, Header, TextArea } from "semantic-ui-react"
import { clearForm, setLocation, setHint } from "../../reducers/form"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { toastConfig } from "../../options/toast"
import { toast } from "react-toastify"
import axios from "axios"
import classNames from "classnames"
import LocationInfo from "../Map/locationInfo"
import MapComponent from "../Map"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const AnswerTab = ({ callback = () => null }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const action = useSelector((state) => state.form.action)
    const file = useSelector((state) => state.form.file)
    const char = useSelector((state) => state.form.char)
    const video = useSelector((state) => state.form.video)
    const location = useSelector((state) => state.form.location)
    const hint = useSelector((state) => state.form.hint)

    const [formLoading, setFormLoading] = useState(false)

    const submitQuiz = () => {
        setFormLoading(true)

        const formData = new FormData()
        formData.set("file", file)
        formData.set("videoId", video.id)
        formData.set("charId", char.id)
        formData.set("lat", location.lat)
        formData.set("lng", location.lng)
        formData.set("hint", hint)

        if (action.id !== 0) {
            formData.set("actionId", action.id)
        }

        if (action.value !== null) {
            formData.set("action", action.value)
        }

        axios
            .post(`${apiBaseUrl}quiz/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`,
                    "Content-Type": "multipart/form-data",
                    enctype: "multipart/form-data"
                }
            })
            .then((response) => {
                const quizId = response.data.quiz
                dispatch(clearForm())
                setFormLoading(false)
                callback()
                navigate(`/${quizId}`)
            })
            .catch((error) => {
                toast.error(error.response.data.message, {
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

    const hintLimit = 20
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
    callback: PropTypes.func
}

export default AnswerTab
