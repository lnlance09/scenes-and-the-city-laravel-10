import "../index.scss"
import { Grid, Header, Image, Menu, Placeholder, Segment } from "semantic-ui-react"
import { translateDate } from "../../../utils/date"
import { timeout } from "../../../utils/general"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    setHistoryAnswers,
    setHistoryQuizzes,
    resetHistoryAnswers,
    resetHistoryQuizzes
} from "../../../reducers/home"
import ModalComponent from "./modal"
import NotFoundSvg from "../../../images/not-found.svg"
import NotFoundSvgInverted from "../../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const HistoryModal = ({ activeItem = "answers", callback = () => null, modalOpen = false }) => {
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
        setHistoryFilter(activeItem)
    }, [activeItem])

    useEffect(() => {
        if (isAuth) {
            getHistory(historyFilter)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuth, historyFilter])

    const getHistory = async (type) => {
        if (type === "quizzes") {
            dispatch(resetHistoryQuizzes())
        }
        if (type === "answers") {
            dispatch(resetHistoryAnswers())
        }
        await timeout(500)
        fetch(`${apiBaseUrl}users/history?type=${type}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`
            }
        })
            .then((response) => response.json())
            .then((response) => {
                if (type === "quizzes") {
                    const { quizzes } = response.data
                    dispatch(
                        setHistoryQuizzes({
                            quizzes: { count: quizzes.length, data: quizzes, isLoading: false }
                        })
                    )
                }
                if (type === "answers") {
                    const { answers } = response.data
                    dispatch(
                        setHistoryAnswers({
                            answers: { count: answers.length, data: answers, isLoading: false }
                        })
                    )
                }
            })
            .catch((error) => {})
    }

    const emptyMsg = (msg) => (
        <Segment inverted={inverted} padded="very">
            <Header className="emptyHeader" content={msg} inverted={inverted} textAlign="center" />
        </Segment>
    )

    const displayQuizzes = (data, count, loading) => {
        if (count === 0 && !loading) {
            return emptyMsg(lang.history.emptyQuizzesMsg)
        }
        const items = data.map((q, i) => {
            return (
                <Segment
                    key={`quiz-scene-${i}`}
                    className="historyAnswerSegment"
                    inverted={inverted}
                    onClick={() => {
                        if (loading) {
                            return
                        }
                        navigate(`/${q.id}`)
                        callback(false)
                    }}
                    size="large"
                >
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={6}>
                                {loading ? (
                                    <Placeholder inverted={inverted}>
                                        <Placeholder.Image />
                                    </Placeholder>
                                ) : (
                                    <Image
                                        alt={`${lang.history.sceneFrom} ${q.video.title} (${q.video.year})`}
                                        onError={(i) => (i.target.src = notFoundImg)}
                                        rounded
                                        size="small"
                                        src={q.img}
                                    />
                                )}
                            </Grid.Column>
                            <Grid.Column width={10}>
                                {loading ? (
                                    <Placeholder inverted={inverted}>
                                        <Placeholder.Line length="very long" />
                                        <Placeholder.Line length="long" />
                                        <Placeholder.Line length="very long" />
                                    </Placeholder>
                                ) : (
                                    <Header floated="left" inverted={inverted} size="small">
                                        <Header.Content>
                                            {`${lang.history.sceneFrom} ${q.video.title} (${q.video.year})`}
                                        </Header.Content>
                                        <Header.Subheader>
                                            {translateDate(q.createdAt, language)}
                                        </Header.Subheader>
                                    </Header>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            )
        })
        return <Segment.Group>{items}</Segment.Group>
    }

    const displayAnswers = (data, count, loading) => {
        if (count === 0 && !loading) {
            return emptyMsg(lang.history.emptyAnswersMsg)
        }
        const items = data.map((a, i) => {
            let points = 10
            points = a.hintsUsed === 1 ? 8 : a.hintsUsed === 2 ? 6 : points
            return (
                <Segment
                    key={`answer-scene-${i}`}
                    className="historyAnswerSegment"
                    inverted={inverted}
                    onClick={() => {
                        if (loading) {
                            return
                        }
                        navigate(`/${a.quiz.id}`)
                        callback(false)
                    }}
                    size="large"
                >
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={6}>
                                {loading ? (
                                    <Placeholder inverted={inverted}>
                                        <Placeholder.Image />
                                    </Placeholder>
                                ) : (
                                    <Image
                                        alt={`${lang.history.sceneFrom} ${a.quiz.video.title} (${a.quiz.video.year})`}
                                        onError={(i) => (i.target.src = notFoundImg)}
                                        rounded
                                        src={a.quiz.img}
                                    />
                                )}
                            </Grid.Column>
                            <Grid.Column width={10}>
                                {loading ? (
                                    <Placeholder inverted={inverted}>
                                        <Placeholder.Line length="very long" />
                                        <Placeholder.Line length="long" />
                                        <Placeholder.Line length="very long" />
                                    </Placeholder>
                                ) : (
                                    <>
                                        <Header inverted={inverted} size="small">
                                            <Header.Content>
                                                {`${lang.history.sceneFrom} ${a.quiz.video.title} (${a.quiz.video.year})`}
                                            </Header.Content>
                                            <Header.Subheader>
                                                {translateDate(a.createdAt, language)}
                                            </Header.Subheader>
                                        </Header>
                                        {a.correct && (
                                            <Header
                                                color={inverted ? "green" : "blue"}
                                                content={`+${points} ${lang.answer.points}`}
                                                inverted={inverted}
                                                size="tiny"
                                                style={{ marginTop: 0 }}
                                            />
                                        )}
                                    </>
                                )}
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            )
        })
        return <Segment.Group>{items}</Segment.Group>
    }

    return (
        <div className="historyModalComponent">
            <ModalComponent
                callback={() => callback(false)}
                className={{ settingsModal: true }}
                open={modalOpen}
                title={lang.header.history}
            >
                <Menu inverted={inverted} pointing secondary size="huge">
                    <Menu.Item
                        active={historyFilter === "answers"}
                        name="Answers"
                        onClick={async () => {
                            setHistoryFilter("answers")
                        }}
                    >
                        {lang.history.answers}
                    </Menu.Item>
                    <Menu.Item
                        active={historyFilter === "quizzes"}
                        name="Quizzes"
                        onClick={async () => {
                            setHistoryFilter("quizzes")
                        }}
                    >
                        {lang.history.quizzes}
                    </Menu.Item>
                </Menu>
                {historyFilter === "quizzes" && (
                    <>{displayQuizzes(quizzes.data, quizzes.count, quizzes.isLoading)}</>
                )}
                {historyFilter === "answers" && (
                    <>{displayAnswers(answers.data, answers.count, answers.isLoading)}</>
                )}
            </ModalComponent>
        </div>
    )
}

HistoryModal.propTypes = {
    activeItem: PropTypes.string,
    callback: PropTypes.func,
    modalOpen: PropTypes.bool,
    updateSettings: PropTypes.func
}

export default HistoryModal
