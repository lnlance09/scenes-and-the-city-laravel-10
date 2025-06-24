import AuthenticationForm from "../components/Authentication"
import FooterComponent from "../components/Footer"
import HeaderComponent from "../components/Header"
import { Modal } from "react-responsive-modal"
import {
    Button,
    Card,
    Container,
    Dimmer,
    Divider,
    Grid,
    Header,
    Icon,
    Image,
    Input,
    Modal as SemanticModal,
    Segment,
    Transition
} from "semantic-ui-react"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setActions } from "../reducers/form"
import { setQuiz } from "../reducers/home"
import { Typewriter } from "react-simple-typewriter"
import { appendClassName } from "../utils/general"
import { dateFormat, isSunday, isWeekend, nyc } from "../utils/date"
import { translateMonth, translateWeekday } from "../utils/translate"
import axios from "axios"
import img from "../images/cocktail-uws.png"
import isAlphanumeric from "validator/lib/isAlphanumeric"
import MapComponent from "../components/Map"
import moment, { duration } from "moment-timezone"
import PropTypes from "prop-types"
import Timer from "../components/Timer"
import * as translations from "../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const defaultDate = moment().tz(nyc).format(dateFormat)

const HomepageLayout = () => {
    const navigate = useNavigate()
    const { quizId } = useParams()
    const validQuizId = quizId && isAlphanumeric(quizId) && quizId.length === 8

    const dispatch = useDispatch()
    const inverted = useSelector((state) => state.app.inverted)
    const user = useSelector((state) => state.app.user)
    const isAuth = user.id === undefined ? false : true
    console.log("isAuth333", isAuth)

    const [loginModal, toggleLoginModal] = useState(false)
    const [date, setDate] = useState()
    const m = moment(date).tz(nyc)
    const startOfWeek = isSunday(date) ? m.subtract(1, "days").startOf("week") : m.startOf("week")

    useEffect(() => {
        getActions()
        const qs = new URLSearchParams(window.location.search)
        const d = qs.get("d")
        if (!moment(d, dateFormat, true).isValid()) {
            navigate(`/?d=${defaultDate}`)
            return
        }

        setDate(d)
        getQuiz(`quiz/date/${d}`)
    }, [])

    useEffect(() => {
        if (validQuizId) {
            getQuiz(`quiz/${quizId}`)
            return
        }
    }, [validQuizId, quizId])

    const getQuiz = (url) => {
        axios({
            url: `${apiBaseUrl}${url}`
        })
            .then((response) => {
                const quiz = response.data
                console.log("quiz response", quiz)
                setQuiz({ quiz })
            })
            .catch((error) => {
                console.error("error getting quiz", error)
            })
    }

    const getActions = () => {
        axios({
            url: `${apiBaseUrl}actions`
        }).then((response) => {
            const { actions } = response.data.data
            dispatch(setActions({ actions }))
        })
    }

    const isAfterToday = false

    return (
        <div className={appendClassName("homePage", inverted)}>
            <HeaderComponent
                date={date}
                isAuth={isAuth}
                onClickDate={(d) => {
                    setDate(d)
                    navigate(`/?d=${moment(d).format(dateFormat)}`)
                }}
                showDates={!validQuizId}
                startOfWeek={startOfWeek.add(1, "days").format(dateFormat)}
            />
            <ImageComponent
                date={date}
                goToLastWeek={(d) => {
                    const lastWeek = moment(d).tz(nyc).subtract(7, "days").format(dateFormat)
                    setDate(lastWeek)
                    navigate(`/?d=${lastWeek}`)
                }}
                goToToday={() => {
                    const today = moment().tz(nyc).format(dateFormat)
                    setDate(today)
                    navigate(`/?d=${today}`)
                }}
                isAuth={isAuth}
                isWeekend={isWeekend(date)}
                validQuizId={validQuizId}
            />
            {isAfterToday && (
                <>
                    <QuestionsComponent />
                    <HintsComponent
                        callback={() => {
                            if (isAuth) {
                                return
                            }
                            toggleLoginModal(true)
                        }}
                    />
                    <AnswersComponent date={date} isAuth={isAuth} />
                </>
            )}
            <FooterComponent />
            <Modal
                classNames={{
                    overlay: appendClassName("loginModalOverlay simpleModalOverlay", inverted),
                    modal: appendClassName("loginModal simpleModal", inverted)
                }}
                center
                onClose={() => toggleLoginModal(false)}
                onOpen={() => toggleLoginModal(true)}
                open={loginModal}
                showCloseIcon={false}
            >
                <AuthenticationForm size="large" />
            </Modal>
        </div>
    )
}

const ImageComponent = ({
    isWeekend = isWeekend(),
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek = () => null,
    goToToday = () => null,
    validQuizId = false
}) => {
    const user = useSelector((state) => state.app.user)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [modalOpen, setModalOpen] = useState(false)

    const nycDate = moment(date).tz(nyc)
    const minusOneDay = moment(date).tz(nyc).subtract(1, "days")
    const plusOneDay = moment(date).tz(nyc).add(1, "days")
    const saturday = isSunday(date) ? minusOneDay : nycDate
    const sunday = isSunday(date) ? nycDate : plusOneDay
    const satMonth = translateMonth(saturday.format("MMMM"), language)
    const sunMonth = translateMonth(sunday.format("MMMM"), language)
    const dateRange = `${satMonth} ${saturday.format("DD")} - ${sunMonth} ${sunday.format("DD")}`
    const yeayFormat = moment(date).format("YYYY")

    return (
        <>
            <Container className={`mainContainer${validQuizId ? " quiz" : ""}`} text>
                <Header className="dateHeader" inverted={inverted} size="large">
                    {isWeekend ? (
                        <>
                            {lang.main.weekendOf} {dateRange}, {yeayFormat}
                        </>
                    ) : (
                        <>
                            {translateWeekday(moment(date).format("dddd"), language)},{" "}
                            {translateMonth(moment(date).format("MMMM"), language)}{" "}
                            {moment(date).format("DD")}, {yeayFormat}
                        </>
                    )}
                    <Header.Subheader>
                        <div
                            className="navigatePrev"
                            onClick={() => {
                                goToLastWeek(date)
                            }}
                        >
                            <Icon inverted={inverted} name="arrow left circle" size="small" />
                            {lang.main.seeLastWeek}
                        </div>
                        {moment().week() - moment(date).week() > 0 && (
                            <div className="navigateToday" onClick={() => goToToday(date)}>
                                <span>{lang.main.seeToday}</span>
                                <Icon inverted={inverted} name="arrow right circle" size="small" />
                            </div>
                        )}
                        <div className="clearfix"></div>
                    </Header.Subheader>
                </Header>
                <Transition animation="slide left" duration={duration} visible={true}>
                    <div>
                        {inverted ? (
                            <Image
                                alt="Scenes and the City"
                                onClick={() => setModalOpen(true)}
                                onError={() => null}
                                rounded
                                src={img}
                            />
                        ) : (
                            <Card centered raised fluid>
                                <Card.Content>
                                    <Image
                                        alt="Scenes and the City"
                                        fluid
                                        onClick={() => setModalOpen(true)}
                                        size="big"
                                        src={img}
                                    />
                                </Card.Content>
                            </Card>
                        )}
                    </div>
                </Transition>
            </Container>
            <SemanticModal
                basic
                onClose={() => setModalOpen(false)}
                onOpen={() => setModalOpen(true)}
                open={modalOpen}
                size="large"
            >
                <SemanticModal.Content>
                    <Image alt="Scenes and the City" src={img} />
                </SemanticModal.Content>
            </SemanticModal>
        </>
    )
}

ImageComponent.propTypes = {
    date: PropTypes.string,
    goToLastWeek: PropTypes.func,
    goToToday: PropTypes.func,
    isAuth: PropTypes.bool,
    isWeekend: PropTypes.bool,
    validQuizId: PropTypes.bool
}

const QuestionsComponent = () => {
    const inverted = useSelector((state) => state.app.inverted)

    return (
        <div className={appendClassName("questionContainer", inverted)}>
            <Container text>
                <Header
                    className="questionHeader"
                    id="questionHeader"
                    inverted={inverted}
                    size="large"
                >
                    <Typewriter
                        cursor
                        cursorBlinking
                        cursorStyle={<span className="cursorGreen">|</span>}
                        words={[
                            "It's 1988 and Brian Flanagan is seen approximately 8.3 miles north of the location that Patrick Bateman shot at police just one year earlier."
                        ]}
                    />
                </Header>
            </Container>
        </div>
    )
}

const HintsComponent = ({ isAuth = false, callback = () => null }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [hintOneVisible, setHintOneVisible] = useState(false)
    const [hintTwoVisible, setHintTwoVisible] = useState(false)

    const hintBox = (text, hint, visible, callback) => (
        <Grid.Column>
            <Header as="h2" content={text} inverted={inverted} />
            <Dimmer.Dimmable
                as={Segment}
                blurring
                className="padded very"
                dimmed={!visible}
                inverted={inverted}
            >
                <Dimmer active={!visible} inverted={inverted}>
                    <Button
                        color={inverted ? "green" : "blue"}
                        content={lang.answer.reveal}
                        inverted={inverted}
                        onClick={callback}
                    />
                </Dimmer>
                {visible ? (
                    <p>{hint}</p>
                ) : (
                    <div className="hintPlaceholder">
                        <Header
                            content="He's in the mafia. He's in the mafia. He's in the mafia. He's in the mafia.
                        He's in the mafia. He's in the mafia. He's in the mafia."
                            inverted={inverted}
                            size="large"
                        />
                    </div>
                )}
            </Dimmer.Dimmable>
        </Grid.Column>
    )

    return (
        <>
            <Segment className="hintsSegment" inverted={inverted} vertical>
                <Grid celled="internally" columns="equal" inverted={inverted} stackable>
                    <Grid.Row>
                        {hintBox(lang.answer.hintOne, "", hintOneVisible, (visible) => {
                            callback()
                            if (isAuth) {
                                setHintOneVisible(!visible)
                            }
                        })}
                        {hintBox(lang.answer.hintTwo, "", hintTwoVisible, (visible) => {
                            callback()
                            if (isAuth) {
                                setHintTwoVisible(!visible)
                            }
                        })}
                    </Grid.Row>
                </Grid>
            </Segment>
        </>
    )
}

HintsComponent.propTypes = {
    isAuth: PropTypes.bool
}

const AnswersComponent = ({ date = moment().tz(nyc).format(dateFormat), isAuth = false }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const expirationDate = moment().tz(nyc).add(1, "days").startOf("day").toDate()

    return (
        <Segment className="answersSegment" inverted={inverted} vertical>
            <Container text>
                {moment(date).isSameOrAfter(moment().subtract(1, "days")) && (
                    <>
                        <Header as="h2" inverted={inverted} textAlign="center">
                            <Header.Content>{lang.answer.title}</Header.Content>
                            <Header.Subheader>
                                <Timer expiryTimestamp={expirationDate} inverted={inverted} />
                            </Header.Subheader>
                        </Header>
                        <Input
                            fluid
                            inverted={inverted}
                            placeholder={lang.answer.placeholder}
                            type="text"
                        />
                        <Divider content={lang.answer.or} horizontal inverted={inverted} />
                    </>
                )}
                <MapComponent />
                <Button
                    color={inverted ? "green" : "yellow"}
                    content={lang.answer.submit}
                    fluid
                    inverted={inverted}
                    onClick={() => {
                        if (isAuth) {
                            // submit answer with api
                            return
                        }
                    }}
                    size="large"
                />
            </Container>
        </Segment>
    )
}

AnswersComponent.propTypes = {
    date: PropTypes.string,
    isAuth: PropTypes.bool
}

export default HomepageLayout
