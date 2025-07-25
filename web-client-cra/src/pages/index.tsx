import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setActions } from "@reducers/form"
import {
    clearAnswer,
    clearQuiz,
    setAnswerGeoData,
    setHasAnswered,
    setHintsUsed,
    setQuiz,
    setPartTwo,
    setMarginOfError,
    setCorrect
} from "../reducers/home"
import { dateFormat, isSunday, isWeekend, nyc } from "@utils/date"
import { timeout } from "@utils/general"
import { useNavigate, useParams } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { ReduxState } from "../interfaces"
import axios from "axios"
import classNames from "classnames"
import isAlphanumeric from "validator/lib/isAlphanumeric"
import moment from "moment-timezone"
import ModalComponent from "@/components/primary/Modal"
import AuthenticationForm from "@/components/primary/Authentication"
import HeaderComponent from "@/components/secondary/Header"
import AnswerSection from "@/components/secondary/Answer"
import HintsSection from "@/components/secondary/Hints"
import ImageSection from "@/components/secondary/Image"
import QuestionSection from "@/components/secondary/Question"
import { Segment } from "semantic-ui-react"

const defaultDate = moment().tz(nyc).format(dateFormat)

const IndexPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { slug } = useParams()

    const validQuizId = typeof slug === "string" && isAlphanumeric(slug) && slug.length === 8
    const validDate = moment(slug, dateFormat, true).isValid()
    const quizId = validQuizId ? slug : null

    const hasAnswered = useSelector((state: ReduxState) => state.home.answer.hasAnswered)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const verify = useSelector((state: ReduxState) => state.app.verify)

    const [animation, setAnimation] = useState("fly left")
    const [date, setDate] = useState(defaultDate)
    const [imgVisible, setImgVisible] = useState(true)
    const [loading, setLoading] = useState(true)
    const [loginModal, toggleLoginModal] = useState(false)
    const [quiz404, setQuiz404] = useState(false)

    const isToday = moment(date).tz(nyc).isSameOrAfter(moment().subtract(1, "days"))
    const isAfterToday = (date: string) =>
        moment(date, dateFormat).tz(nyc).isAfter(moment().tz(nyc))
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
        if (validDate && typeof slug === "string") {
            setDate(slug)
            getQuiz(`/show/date?date=${slug}`)
            return
        }
        navigate(`/${defaultDate}`)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, validQuizId, validDate])

    const getQuiz = async (url: string) => {
        setImgVisible(false)
        setLoading(true)
        dispatch(clearAnswer())

        const fullUrl = `${process.env.REACT_APP_API_BASE_URL}quiz${url}`
        await axios
            .get(fullUrl, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then((response) => {
                const { answer, partTwo, quiz } = response.data
                const createdAt = moment(quiz.createdAt, "YYYY-MM-DD HH:mm:ss")
                    .tz(nyc)
                    .format(dateFormat)

                setDate(createdAt)
                setQuiz404(false)
                dispatch(setQuiz({ quiz }))
                dispatch(setPartTwo({ partTwo }))

                const { correct, hasAnswered, geoData, hintsUsed } = answer
                dispatch(setHasAnswered({ hasAnswered }))
                dispatch(setHintsUsed({ hintsUsed }))
                dispatch(setAnswerGeoData({ geoData }))
                dispatch(setCorrect({ correct }))

                if (hasAnswered) {
                    dispatch(setMarginOfError({ margin: answer.marginOfError }))
                }
            })
            .catch(() => {
                setQuiz404(true)
                dispatch(clearQuiz())
            })

        await timeout(700)
        setLoading(false)
        await timeout(300)
        setImgVisible(true)
    }

    const getActions = () => {
        const url = `${process.env.REACT_APP_API_BASE_URL}actions`
        axios.get(url).then((response) => {
            const { actions } = response.data.data
            dispatch(setActions({ actions }))
        })
    }

    const goToToday = () => {
        const today = isSunday()
            ? moment().tz(nyc).subtract(1, "days").format(dateFormat)
            : moment().tz(nyc).format(dateFormat)
        setDate(today)
        navigate(`/${today}`)
    }

    const homePageClass = classNames({
        homePage: true,
        inverted
    })

    return (
        <div className={homePageClass}>
            <HeaderComponent
                date={date}
                loginModalOpen={loginModal}
                onClickDate={(d: string) => {
                    const direction = moment(d, dateFormat).isAfter(moment(date, dateFormat))
                        ? "left"
                        : "right"
                    setAnimation(`fly ${direction}`)
                    setDate(d)
                    navigate(`/${moment(d).tz(nyc).format(dateFormat)}`)
                }}
                onClickLogo={() => goToToday()}
                showDates={!validQuizId}
                toggleLoginModal={() => toggleLoginModal(true)}
            />
            <ImageSection
                animation={animation}
                date={date}
                goToLastWeek={(d: string) => {
                    const lastWeek = moment(d).tz(nyc).subtract(7, "days").format(dateFormat)
                    setDate(lastWeek)
                    navigate(`/${lastWeek}`)
                }}
                goToToday={() => goToToday()}
                imgVisible={imgVisible}
                isInFuture={isInFuture}
                isWeekend={isWeekend(date)}
                loading={loading}
                quiz404={quiz404}
                validQuizId={validQuizId}
            />
            <QuestionSection loading={loading} quiz404={quiz404} />
            {(isToday || hasAnswered) && !quiz404 && (
                <HintsSection callback={() => toggleLoginModal(true)} loading={loading} />
            )}
            {!isInFuture && !quiz404 && (
                <AnswerSection
                    callback={() => toggleLoginModal(true)}
                    date={date}
                    loading={loading}
                />
            )}
            <ModalComponent callback={() => toggleLoginModal(false)} open={loginModal}>
                {inverted ? (
                    <Segment inverted padded="very">
                        <AuthenticationForm
                            loginCallback={() => toggleLoginModal(false)}
                            verifyCallback={() => toggleLoginModal(false)}
                            size="large"
                        />
                    </Segment>
                ) : (
                    <AuthenticationForm
                        loginCallback={() => toggleLoginModal(false)}
                        verifyCallback={() => toggleLoginModal(false)}
                        size="large"
                    />
                )}
            </ModalComponent>
            <ToastContainer
                className={inverted ? "inverted" : ""}
                icon={false}
                position="top-center"
            />
        </div>
    )
}

export default IndexPage
