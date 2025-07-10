import "../index.scss"
import { Header, Image, Label, Menu, Segment } from "semantic-ui-react"
import { translateDate } from "../../../utils/date"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setHistoryAnswers, setHistoryQuizzes } from "../../../reducers/home"
import axios from "axios"
import ModalComponent from "./modal"
import NotFoundSvg from "../../../images/not-found.svg"
import NotFoundSvgInverted from "../../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const HistoryModal = ({ callback = () => null, modalOpen = false }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const isAuth = useSelector((state) => state.app.auth)
    const quizzes = useSelector((state) => state.home.history.quizzes)
    const answers = useSelector((state) => state.home.history.answers)
    const inverted = useSelector((state) => state.app.inverted)
    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [historyFilter, setHistoryFilter] = useState("answers")

    useEffect(() => {
        if (isAuth) {
            getHistory(historyFilter)
        }
    }, [isAuth, historyFilter])

    const getHistory = (type) => {
        axios({
            url: `${apiBaseUrl}users/history?type=${type}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`
            }
        }).then((response) => {
            if (type === "quizzes") {
                const { quizzes } = response.data.data
                dispatch(
                    setHistoryQuizzes({
                        quizzes: { count: quizzes.length, data: quizzes, isLoading: false }
                    })
                )
            }
            if (type === "answers") {
                const { answers } = response.data.data
                dispatch(
                    setHistoryAnswers({
                        answers: { count: answers.length, data: answers, isLoading: false }
                    })
                )
            }
        })
    }

    const emptyMsg = (msg) => (
        <Segment inverted={inverted} padded="very">
            <Header className="emptyHeader" content={msg} inverted={inverted} textAlign="center" />
        </Segment>
    )

    const displayQuizzes = (data, count = 0) => {
        if (count === 0) {
            return emptyMsg("You haven't submitted any quizzes yet...")
        }
        const items = data.map((q) => {
            return (
                <Segment
                    className="historyAnswerSegment"
                    inverted={inverted}
                    onClick={() => {
                        navigate(`/${q.quizId}`)
                        callback(false)
                    }}
                    size="large"
                >
                    <div>
                        <Image
                            alt={`Scene from ${q.video.title} (${q.video.year})`}
                            floated="left"
                            inline
                            onError={(i) => (i.target.src = notFoundImg)}
                            rounded
                            size="small"
                            src={q.img}
                        />
                        <Header floated="left" inverted={inverted} size="small">
                            <Header.Content>
                                {`Scene from ${q.video.title} (${q.video.year})`}
                            </Header.Content>
                            <Header.Subheader>
                                {translateDate(q.createdAt, language)}
                            </Header.Subheader>
                        </Header>
                        <div className="clearfix"></div>
                    </div>
                </Segment>
            )
        })
        return <Segment.Group fluid>{items}</Segment.Group>
    }

    const displayAnswers = (data, count = 0) => {
        if (count === 0) {
            return emptyMsg("You haven't anywered anything yet...")
        }
        const items = data.map((a) => {
            return (
                <Segment
                    className="historyAnswerSegment"
                    inverted={inverted}
                    onClick={() => {
                        navigate(`/${a.quiz.id}`)
                        callback(false)
                    }}
                    size="large"
                >
                    <Label as="a" color="green" corner="right" icon="checkmark" />
                    <div>
                        <Image
                            alt={`Scene from ${a.quiz.video.title} (${a.quiz.video.year})`}
                            floated="left"
                            inline
                            onError={(i) => (i.target.src = notFoundImg)}
                            rounded
                            size="small"
                            src={a.quiz.img}
                        />
                        <Header floated="left" inverted={inverted} size="small">
                            <Header.Content>
                                {`Scene from ${a.quiz.video.title} (${a.quiz.video.year})`}
                            </Header.Content>
                            <Header.Subheader>
                                {translateDate(a.createdAt, language)}
                            </Header.Subheader>
                        </Header>
                        <div className="clearfix"></div>
                    </div>
                </Segment>
            )
        })
        return <Segment.Group fluid>{items}</Segment.Group>
    }

    return (
        <div className="historyModalComponent">
            <ModalComponent
                callback={() => callback(false)}
                open={modalOpen}
                title={lang.main.history}
            >
                <Menu inverted={inverted} pointing secondary size="huge">
                    <Menu.Item
                        active={historyFilter === "answers"}
                        name="Answers"
                        onClick={() => setHistoryFilter("answers")}
                    />
                    <Menu.Item
                        active={historyFilter === "quizzes"}
                        name="Quizzes"
                        onClick={() => setHistoryFilter("quizzes")}
                    />
                </Menu>
                {historyFilter === "quizzes" && <>{displayQuizzes(quizzes.data, quizzes.count)}</>}
                {historyFilter === "answers" && <>{displayAnswers(answers.data, answers.count)}</>}
            </ModalComponent>
        </div>
    )
}

HistoryModal.propTypes = {
    callback: PropTypes.func,
    modalOpen: PropTypes.bool
}

export default HistoryModal
