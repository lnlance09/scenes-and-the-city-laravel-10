import AuthenticationForm from "../components/Authentication"
import FooterComponent from "../components/Footer"
import HeaderComponent from "../components/Header"
import { Modal } from "react-responsive-modal"
import {
    Button,
    Card,
    Container,
    Dimmer,
    Grid,
    Header,
    Icon,
    Image,
    Modal as SemanticModal,
    Segment,
    Transition,
    Placeholder
} from "semantic-ui-react"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setActions } from "../reducers/form"
import { setQuiz } from "../reducers/home"
import { Typewriter } from "react-simple-typewriter"
import { dateFormat, isSunday, isWeekend, nyc } from "../utils/date"
import { translateMonth, translateWeekday } from "../utils/translate"
import { toast, ToastContainer } from "react-toastify"
import { toastConfig } from "../options/toast"
import axios from "axios"
import classNames from "classnames"
import img from "../images/cocktail-uws.png"
import isAlphanumeric from "validator/lib/isAlphanumeric"
import MapComponent from "../components/Map"
import moment, { duration } from "moment-timezone"
import NotFoundImg from "../images/not-found.svg"
import PropTypes from "prop-types"
import Timer from "../components/Timer"
import * as translations from "../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const defaultDate = moment().tz(nyc).format(dateFormat)

const timeout = (delay) => {
    return new Promise((res) => setTimeout(res, delay))
}

const HomepageLayout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { slug } = useParams()
    const validQuizId = slug && isAlphanumeric(slug) && slug.length === 8
    const validDate = moment(slug, dateFormat, true).isValid()
    const quizId = validQuizId ? slug : null

    const inverted = useSelector((state) => state.app.inverted)
    const isAuth = useSelector((state) => state.app.auth)

    const [date, setDate] = useState()
    const [loading, setLoading] = useState(true)
    const [loginModal, toggleLoginModal] = useState(false)
    const [quiz404, setQuiz404] = useState(false)

    useEffect(() => {
        getActions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (validQuizId) {
            getQuiz(`/${quizId}`)
            return
        }
        if (validDate) {
            getQuiz(`/date?date=${slug}`)
            setDate(slug)
            return
        }
        navigate(`/${defaultDate}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    const getQuiz = (url) => {
        setLoading(true)
        axios({
            url: `${apiBaseUrl}quiz${url}`
        })
            .then(async (response) => {
                const quiz = response.data.data
                setQuiz404(false)
                dispatch(setQuiz({ quiz }))
                setDate(quiz.createdAt)
                await timeout(800)
                setLoading(false)
            })
            .catch(async (error) => {
                setQuiz404(true)
                await timeout(800)
                setLoading(false)
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

    const isAfterToday = moment(date, dateFormat).isAfter(moment().tz(nyc))

    const homePageClass = classNames({
        homePage: true,
        inverted
    })
    const modalClass = classNames({
        loginModal: true,
        simpleModal: true,
        inverted
    })
    const modalOverlayClass = classNames({
        loginModalOverlay: true,
        simpleModalOverlay: true,
        inverted
    })
    const mainContainerClass = classNames({
        mainContainer: true
    })

    return (
        <div className={homePageClass}>
            <HeaderComponent
                date={date}
                isAuth={isAuth}
                onClickDate={(d) => {
                    setDate(d)
                    navigate(`/${moment(d).format(dateFormat)}`)
                }}
                showDates={!validQuizId}
            />
            {validQuizId && quiz404 ? (
                <Container className={mainContainerClass} text>
                    <Header
                        content="That quiz does not exist!"
                        inverted={inverted}
                        textAlign="center"
                    />
                </Container>
            ) : (
                <>
                    <ImageComponent
                        date={date}
                        goToLastWeek={(d) => {
                            const lastWeek = moment(d)
                                .tz(nyc)
                                .subtract(7, "days")
                                .format(dateFormat)
                            setDate(lastWeek)
                            navigate(`/${lastWeek}`)
                        }}
                        goToToday={() => {
                            const today = moment().tz(nyc).format(dateFormat)
                            setDate(today)
                            navigate(`/${today}`)
                        }}
                        isAfterToday={isAfterToday}
                        isWeekend={isWeekend(date)}
                        loading={loading}
                        validQuizId={validQuizId}
                    />
                    {!isAfterToday && (
                        <>
                            <QuestionsComponent loading={loading} />
                            <HintsComponent
                                callback={() => {
                                    toggleLoginModal(true)
                                }}
                                loading={loading}
                            />
                            <AnswersComponent
                                callback={() => {
                                    toggleLoginModal(true)
                                }}
                                date={date}
                            />
                        </>
                    )}
                </>
            )}
            <FooterComponent />
            <Modal
                classNames={{
                    overlay: modalOverlayClass,
                    modal: modalClass
                }}
                center
                onClose={() => toggleLoginModal(false)}
                onOpen={() => toggleLoginModal(true)}
                open={loginModal}
                showCloseIcon={false}
            >
                <AuthenticationForm closeModal={() => toggleLoginModal(false)} size="large" />
            </Modal>
        </div>
    )
}

const ImageComponent = ({
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek = () => null,
    goToToday = () => null,
    isAfterToday = false,
    isWeekend = isWeekend(),
    loading = true,
    validQuizId = false
}) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const quiz = useSelector((state) => state.home.quiz)
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
    const yearFormat = moment(date).format("YYYY")

    const day = moment(date).format("dddd")
    const month = moment(date).format("MMMM")
    const dayOfMonth = moment(date).format("DD")
    let title = `${translateWeekday(day, language)}, ${translateMonth(month, language)} ${dayOfMonth}, ${yearFormat}`
    if (isWeekend) {
        title = `${lang.main.weekendOf} ${dateRange}, ${yearFormat}`
    }

    const olderThanWeek = moment().week() - moment(date).week() > 0

    const mainContainerClass = classNames({
        mainContainer: true,
        quiz: validQuizId,
        afterToday: isAfterToday
    })

    const quizImg = (
        <>
            {loading ? (
                <Placeholder fluid inverted={inverted}>
                    <Placeholder.Image style={{ height: "360px" }} />
                </Placeholder>
            ) : (
                <Image
                    alt="Scenes and the City"
                    onClick={() => setModalOpen(true)}
                    // onError={(i) => (i.target.src = defaultImg)}
                    rounded
                    style={{ height: "360px" }}
                    src={img}
                />
            )}
        </>
    )

    return (
        <>
            <Container className={mainContainerClass} text>
                <Header className="dateHeader" inverted={inverted} size="large">
                    {title}
                    {!isAfterToday && !validQuizId && (
                        <Header.Subheader>
                            <div className="navigatePrev" onClick={() => goToLastWeek(date)}>
                                <Icon inverted={inverted} name="arrow left circle" size="small" />
                                {lang.main.seeLastWeek}
                            </div>
                            {olderThanWeek && (
                                <div className="navigateToday" onClick={() => goToToday(date)}>
                                    <span>{lang.main.seeToday}</span>
                                    <Icon
                                        inverted={inverted}
                                        name="arrow right circle"
                                        size="small"
                                    />
                                </div>
                            )}
                            <div className="clearfix"></div>
                        </Header.Subheader>
                    )}
                    {validQuizId && (
                        <Header.Subheader>
                            By {quiz.username} - {moment(quiz.createdAt).tz(nyc).fromNow()}
                        </Header.Subheader>
                    )}
                </Header>
                {isAfterToday ? (
                    <>
                        <Image
                            alt="Not Found"
                            centered
                            id="logo"
                            src={NotFoundImg}
                            style={{ height: "250px", marginTop: "5em" }}
                        />
                    </>
                ) : (
                    <Transition animation="slide left" duration={duration} visible={true}>
                        <div>
                            {inverted ? (
                                quizImg
                            ) : (
                                <Card centered raised fluid>
                                    <Card.Content>{quizImg}</Card.Content>
                                </Card>
                            )}
                        </div>
                    </Transition>
                )}
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
            <ToastContainer />
        </>
    )
}

ImageComponent.propTypes = {
    date: PropTypes.string,
    goToLastWeek: PropTypes.func,
    goToToday: PropTypes.func,
    isAfterToday: PropTypes.bool,
    isWeekend: PropTypes.bool,
    loading: PropTypes.bool,
    validQuizId: PropTypes.bool
}

const QuestionsComponent = ({ loading = true }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const questionContainerClass = classNames({
        questionContainer: true,
        inverted
    })
    const quiz = useSelector((state) => state.home.quiz)

    return (
        <div className={questionContainerClass}>
            <Container text>
                <Header
                    className="questionHeader"
                    id="questionHeader"
                    inverted={inverted}
                    size="large"
                >
                    {!loading && (
                        <Typewriter
                            cursor
                            cursorBlinking
                            cursorStyle={<span className="cursorGreen">|</span>}
                            words={[quiz.text]}
                        />
                    )}
                </Header>
            </Container>
        </div>
    )
}

QuestionsComponent.propTypes = {
    loading: PropTypes.bool
}

const HintsComponent = ({ callback = () => null, loading = true }) => {
    const quiz = useSelector((state) => state.home.quiz)
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [hintOneVisible, setHintOneVisible] = useState(false)
    const [hintTwoVisible, setHintTwoVisible] = useState(false)

    const getHint = (quizId) => {
        axios
            .post(`${apiBaseUrl}quiz/hint/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then(() => {
                toast.success("First hint has been used!", toastConfig)
            })
            .catch((error) => {
                let errorMsg = ""
                const { status } = error.response
                const { errors } = error.response.data
                if (status === 401) {
                    errorMsg = error.response.data.message
                } else {
                    if (typeof errors.code !== "undefined") {
                        errorMsg = errors.code[0]
                    }
                }
                toast.error(errorMsg, toastConfig)
            })
    }

    const hintBox = (text, hint, visible, callback, loading) => (
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
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                            commodo consequat.
                        </p>
                    ) : (
                        <div className="hintPlaceholder">
                            <Header
                                content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
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
        <>
            <Segment className="hintsSegment" inverted={inverted} vertical>
                <Grid celled="internally" columns="equal" inverted={inverted} stackable>
                    <Grid.Row>
                        <Grid.Column>
                            {hintBox(
                                lang.answer.hintOne,
                                "",
                                hintOneVisible,
                                () => {
                                    if (isAuth) {
                                        getHint(quiz.quizId)
                                        setHintOneVisible(true)
                                        return
                                    }
                                    callback()
                                },
                                loading
                            )}
                        </Grid.Column>
                        <Grid.Column>
                            {hintBox(
                                lang.answer.hintTwo,
                                "",
                                hintTwoVisible,
                                () => {
                                    if (isAuth) {
                                        setHintTwoVisible(true)
                                        return
                                    }
                                    // Trigger the login modal
                                    callback()
                                },
                                loading
                            )}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </>
    )
}

HintsComponent.propTypes = {
    callback: PropTypes.function,
    loading: PropTypes.bool
}

const AnswersComponent = ({
    callback = () => null,
    date = moment().tz(nyc).format(dateFormat)
}) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const expirationDate = moment(date).tz(nyc).add(1, "days").startOf("day").toDate()
    const canSubmit = moment(date).isSameOrAfter(moment().subtract(1, "days"))

    return (
        <Segment className="answersSegment" inverted={inverted} vertical>
            <Container text>
                {canSubmit && (
                    <Header as="h2" inverted={inverted} textAlign="center">
                        <Header.Content>{lang.answer.title}</Header.Content>
                        <Header.Subheader>
                            <Timer expiryTimestamp={expirationDate} inverted={inverted} />
                        </Header.Subheader>
                    </Header>
                )}
                <MapComponent />
                {canSubmit && (
                    <Button
                        className="submitQuizBtn"
                        color={inverted ? "green" : "blue"}
                        content={lang.answer.submit}
                        fluid
                        inverted={inverted}
                        onClick={() => callback()}
                        size="big"
                    />
                )}
            </Container>
        </Segment>
    )
}

AnswersComponent.propTypes = {
    callback: PropTypes.func,
    date: PropTypes.string
}

export default HomepageLayout
