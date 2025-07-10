import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setActions } from "../reducers/form"
import {
    clearAnswer,
    clearQuiz,
    setAnswer,
    setHasAnswered,
    setHintsUsed,
    setQuiz
} from "../reducers/home"
import { defaultAnswer } from "../states/home"
import { dateFormat, isSunday, isWeekend, nyc } from "../utils/date"
import { timeout } from "../utils/general"
import { toast, ToastContainer } from "react-toastify"
import { toastConfig } from "../options/toast"
import axios from "axios"
import classNames from "classnames"
import isAlphanumeric from "validator/lib/isAlphanumeric"
import moment from "moment-timezone"
import ModalComponent from "../components/Header/modals/modal"
import AuthenticationForm from "../components/Authentication"
import FooterComponent from "../components/Footer"
import HeaderComponent from "../components/Header"
import AnswerSection from "../components/Answer"
import HintsSection from "../components/Hints"
import ImageSection from "../components/Image"
import QuestionSection from "../components/Question"
import * as translations from "../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const defaultDate = moment().tz(nyc).format(dateFormat)

const HomepageLayout = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { slug } = useParams()
    const validQuizId = slug && isAlphanumeric(slug) && slug.length === 8
    const validDate = moment(slug, dateFormat, true).isValid()
    const quizId = validQuizId ? slug : null

    const hasAnswered = useSelector((state) => state.home.hasAnswered)
    const inverted = useSelector((state) => state.app.inverted)
    const isAuth = useSelector((state) => state.app.auth)
    const verify = useSelector((state) => state.app.verify)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [animation, setAnimation] = useState("slide left")
    const [date, setDate] = useState()
    const [imgVisible, setImgVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loginModal, toggleLoginModal] = useState(false)
    const [quiz404, setQuiz404] = useState(false)

    const isToday = moment(date).tz(nyc).isSameOrAfter(moment().subtract(1, "days"))
    const isAfterToday = (date) => moment(date, dateFormat).isAfter(moment().tz(nyc))
    const isInFuture = isAfterToday(date)

    useEffect(() => {
        getActions()
        if (verify) {
            toggleLoginModal(true)
        }
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
    }, [slug, validQuizId, validDate])

    const getQuiz = async (url) => {
        setImgVisible(false)
        setLoading(true)
        dispatch(setAnswer(defaultAnswer))

        await axios({
            url: `${apiBaseUrl}quiz${url}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`
            }
        })
            .then((response) => {
                const { quiz } = response.data
                setQuiz404(false)
                setDate(moment(quiz.createdAt).format(dateFormat))
                dispatch(setQuiz({ quiz }))
                if (response.data.answer) {
                    const { answer } = response.data
                    dispatch(setAnswer(answer))
                    dispatch(setHasAnswered({ hasAnswered: true }))
                    dispatch(setHintsUsed({ amount: answer.hintsUsed }))
                } else {
                    dispatch(clearAnswer())
                }
            })
            .catch(() => {
                setQuiz404(true)
                dispatch(clearQuiz())
                toast.error(lang.main.toastErrorMessage, toastConfig)
            })
        await timeout(700)
        setLoading(false)
        await timeout(300)
        setImgVisible(true)
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

    return (
        <div className={homePageClass}>
            <HeaderComponent
                date={date}
                isAuth={isAuth}
                onClickDate={(d) => {
                    setAnimation(
                        moment(d, dateFormat).isAfter(moment(date, dateFormat))
                            ? "fly left"
                            : "fly right"
                    )
                    setDate(d)
                    navigate(`/${moment(d).tz(nyc).format(dateFormat)}`)
                }}
                onClickLogo={() => {
                    const d = isSunday()
                        ? moment().tz(nyc).subtract(1, "days").format(dateFormat)
                        : moment().tz(nyc).format(dateFormat)
                    setDate(d)
                    navigate(`/${d}`)
                }}
                showDates={!validQuizId}
                toggleLoginModal={() => toggleLoginModal(true)}
            />

            <ImageSection
                animation={animation}
                date={date}
                goToLastWeek={(d) => {
                    const lastWeek = moment(d).tz(nyc).subtract(7, "days").format(dateFormat)
                    setDate(lastWeek)
                    navigate(`/${lastWeek}`)
                }}
                goToToday={() => {
                    const today = isSunday()
                        ? moment().tz(nyc).subtract(1, "days").format(dateFormat)
                        : moment().tz(nyc).format(dateFormat)
                    setDate(today)
                    navigate(`/${today}`)
                }}
                imgVisible={imgVisible}
                isInFuture={isInFuture}
                isWeekend={isWeekend(date)}
                loading={loading}
                quiz404={quiz404}
                validQuizId={validQuizId}
            />
            <QuestionSection loading={loading} quiz404={quiz404} />

            {/* Only show the hints and answer sections if it's a valid quiz and a valid date */}
            {(isToday || hasAnswered) && !quiz404 && (
                <HintsSection
                    callback={() => {
                        toggleLoginModal(true)
                    }}
                    loading={loading}
                />
            )}
            {!isInFuture && !quiz404 && (
                <AnswerSection
                    callback={() => {
                        toggleLoginModal(true)
                    }}
                    date={date}
                    loading={loading}
                />
            )}

            <FooterComponent />
            <ModalComponent callback={() => toggleLoginModal(false)} open={loginModal} title={null}>
                <AuthenticationForm closeModal={() => toggleLoginModal(false)} size="large" />
            </ModalComponent>
            <ToastContainer className={inverted ? "inverted" : null} />
        </div>
    )
}

export default HomepageLayout
