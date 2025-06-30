import AuthenticationForm from "../components/Authentication"
import FooterComponent from "../components/Footer"
import HeaderComponent from "../components/Header"
import { Modal } from "react-responsive-modal"
import {
    Button,
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
import { clearQuiz, setAnswer, setQuiz } from "../reducers/home"
import { Typewriter } from "react-simple-typewriter"
import { dateFormat, isSunday, isWeekend, nyc } from "../utils/date"
import { translateMonth, translateWeekday } from "../utils/translate"
import { toast, ToastContainer } from "react-toastify"
import { toastConfig } from "../options/toast"
import axios from "axios"
import classNames from "classnames"
import isAlphanumeric from "validator/lib/isAlphanumeric"
import MapComponent from "../components/Map"
import moment from "moment-timezone"
import NotFoundSvg from "../images/not-found.svg"
import NotFoundSvgInverted from "../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import Timer from "../components/Timer"
import * as translations from "../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const defaultDate = moment().tz(nyc).format(dateFormat)

const timeout = (delay) => {
    return new Promise((res) => setTimeout(res, delay))
}
const duration = 400

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
            if (!isAfterToday(slug)) {
                getQuiz(`/show/date?date=${slug}`)
                return
            }
            setDate(slug)
            setLoading(false)
            setQuiz404(true)
            return
        }
        navigate(`/${defaultDate}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    const isAfterToday = (date) => moment(date, dateFormat).isAfter(moment().tz(nyc))
    const isInFuture = isAfterToday(date)

    const getQuiz = async (url) => {
        setLoading(true)
        await axios({
            url: `${apiBaseUrl}quiz${url}`
        })
            .then((response) => {
                const quiz = response.data.data
                setQuiz404(false)
                setDate(quiz.createdAt)
                dispatch(setQuiz({ quiz }))

                if (isAuth) {
                    getAnswer(quiz.quizId)
                }
            })
            .catch(() => {
                setQuiz404(true)
                dispatch(clearQuiz())
                toast.error("Error fetching quiz", toastConfig)
            })
        await timeout(700)
        setLoading(false)
    }

    const getAnswer = (quizId) => {
        axios({
            url: `${apiBaseUrl}quiz/answer/${quizId}`
        })
            .then((response) => {})
            .catch(() => {
                console.error("Error fetching answer")
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

    return (
        <div className={homePageClass}>
            <HeaderComponent
                date={date}
                isAuth={isAuth}
                onClickDate={(d) => {
                    setDate(d)
                    navigate(`/${moment(d).format(dateFormat)}`)
                }}
                onClickLogo={() => {
                    setDate(moment().tz(nyc).format(dateFormat))
                    navigate(`/`)
                }}
                showDates={!validQuizId}
                toggleLoginModal={() => toggleLoginModal(true)}
            />

            <ImageComponent
                date={date}
                goToLastWeek={(d) => {
                    const lastWeek = moment(d).tz(nyc).subtract(7, "days").format(dateFormat)
                    setDate(lastWeek)
                    navigate(`/${lastWeek}`)
                }}
                goToToday={() => {
                    const today = moment().tz(nyc).format(dateFormat)
                    setDate(today)
                    navigate(`/${today}`)
                }}
                isInFuture={isInFuture}
                isWeekend={isWeekend(date)}
                loading={loading}
                quiz404={quiz404}
                validQuizId={validQuizId}
            />
            <QuestionsComponent loading={loading} quiz404={quiz404} />
            {!isInFuture && !quiz404 && (
                <>
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
            <ToastContainer />
        </div>
    )
}

const ImageComponent = ({
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek = () => null,
    goToToday = () => null,
    isInFuture = false,
    isWeekend = isWeekend(),
    loading = true,
    quiz404 = false,
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
        afterToday: isInFuture,
        quiz404: quiz404
    })

    const quizImg = () => {
        const notFound = inverted ? NotFoundSvgInverted : NotFoundSvg
        const img = (
            <>
                {loading ? (
                    <Placeholder fluid inverted={inverted}>
                        <Placeholder.Image style={{ height: "360px" }} />
                    </Placeholder>
                ) : (
                    <div style={{ textAlign: "center" }}>
                        <Image
                            alt="Scenes and the City"
                            centered
                            onClick={() => setModalOpen(true)}
                            onError={(i) => (i.target.src = NotFoundSvg)}
                            rounded
                            style={{ height: "360px" }}
                            src={quiz.img ? quiz.img : notFound}
                        />
                    </div>
                )}
            </>
        )
        return img
    }

    return (
        <>
            <Container className={mainContainerClass} text>
                <Header className="dateHeader" inverted={inverted} size="large">
                    {title}
                    {!validQuizId && (
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
                    {validQuizId && quiz.quizId !== null && (
                        <Header.Subheader>
                            By {quiz.username} - {moment(quiz.createdAt).tz(nyc).fromNow()}
                        </Header.Subheader>
                    )}
                </Header>
                <Transition animation="slide left" duration={duration} visible={true}>
                    <div>{quizImg()}</div>
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
                    <Image alt="Scenes and the City" fluid src={quiz.img} />
                </SemanticModal.Content>
            </SemanticModal>
        </>
    )
}

ImageComponent.propTypes = {
    date: PropTypes.string,
    goToLastWeek: PropTypes.func,
    goToToday: PropTypes.func,
    isInFuture: PropTypes.bool,
    isWeekend: PropTypes.bool,
    loading: PropTypes.bool,
    quiz404: PropTypes.bool,
    validQuizId: PropTypes.bool
}

const QuestionsComponent = ({ loading = true, quiz404 = false }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const questionContainerClass = classNames({
        questionContainer: true,
        inverted
    })
    const quizText = useSelector((state) => state.home.quiz.text)
    const errorText = "There was en error fetching this quiz."

    return (
        <div className={questionContainerClass}>
            <Container>
                <Header
                    className="questionHeader"
                    id="questionHeader"
                    inverted={inverted}
                    size="large"
                    textAlign="center"
                >
                    {!loading && (
                        <Typewriter
                            cursor
                            cursorBlinking
                            cursorStyle={<span className="cursorGreen">|</span>}
                            words={[quiz404 ? errorText : quizText]}
                        />
                    )}
                </Header>
            </Container>
        </div>
    )
}

QuestionsComponent.propTypes = {
    loading: PropTypes.bool,
    quiz404: PropTypes.bool
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
    callback: PropTypes.func,
    loading: PropTypes.bool
}

const AnswersComponent = ({
    callback = () => null,
    date = moment().tz(nyc).format(dateFormat)
}) => {
    const dispatch = useDispatch()
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const expirationDate = moment(date).tz(nyc).add(1, "days").startOf("day").toDate()
    const canSubmit = moment(date).isSameOrAfter(moment().subtract(1, "days"))
    const answer = useSelector((state) => state.home.answer)

    const submitAnswer = () => {
        axios
            .post(`${apiBaseUrl}quiz/answer`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then(() => {
                toast.success("Your answer has been submitted!", toastConfig)
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

    const showLocationDetails = (data) => {
        dispatch(
            setAnswer({
                lat: data.lat,
                lng: data.lng,
                hood: data.hood,
                borough: data.borough,
                description: data.description
            })
        )
    }

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
                <MapComponent callback={(data) => showLocationDetails(data)} />
                {answer.hood !== null && (
                    <>
                        <Header content={answer.hood} inverted={inverted} />
                    </>
                )}
                {canSubmit && (
                    <Button
                        className="submitQuizBtn"
                        color={inverted ? "green" : "blue"}
                        content={lang.answer.submit}
                        fluid
                        inverted={inverted}
                        onClick={() => submitAnswer()}
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
