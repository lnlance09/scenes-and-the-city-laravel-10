import { Button, Dimmer, Grid, Header, Menu, Placeholder, Segment } from "semantic-ui-react"
import { translateDate } from "@utils/date"
import { timeout } from "@utils/general"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { AnswerWithQuiz, Quiz, ReduxState } from "@interfaces/index"
import {
    setHistoryAnswers,
    setHistoryQuizzes,
    resetHistoryAnswers,
    resetHistoryQuizzes
} from "@reducers/home"
import axios from "axios"
import AuthenticationForm from "@/components/primary/Authentication"
import ImageComponent from "@components/primary/Image"
import ModalComponent from "@components/primary/Modal"
import translations from "@assets/translate.json"

type Props = {
    activeItem?: string
    callback: (param1: boolean) => any
    modalOpen?: boolean
}

const HistoryModal = ({ activeItem = "answers", callback, modalOpen = false }: Props) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const quizzes = useSelector((state: ReduxState) => state.home.history.quizzes)
    const answers = useSelector((state: ReduxState) => state.home.history.answers)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
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

    const getHistory = async (type: string) => {
        if (type === "quizzes") {
            dispatch(resetHistoryQuizzes())
        }
        if (type === "answers") {
            dispatch(resetHistoryAnswers())
        }
        await timeout(500)
        const url = `${process.env.REACT_APP_API_BASE_URL}users/history?type=${type}`
        axios
            .get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then((response) => {
                if (type === "quizzes") {
                    const { quizzes } = response.data.data
                    dispatch(
                        setHistoryQuizzes({
                            quizzes: {
                                count: quizzes.length,
                                data: quizzes,
                                isLoading: false
                            }
                        })
                    )
                }
                if (type === "answers") {
                    const { answers } = response.data.data
                    dispatch(
                        setHistoryAnswers({
                            answers: {
                                count: answers.length,
                                data: answers,
                                isLoading: false
                            }
                        })
                    )
                }
            })
            .catch((error) => {})
    }

    const emptyMsg = (msg: string) => (
        <Segment inverted={inverted} padded="very">
            <Header className="emptyHeader" content={msg} inverted={inverted} textAlign="center" />
        </Segment>
    )

    const displayQuizzes = (data: Quiz[], count: number, loading: boolean) => {
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
                                    <ImageComponent
                                        alt={`${lang.history.sceneFrom} ${q.video.title} (${q.video.year})`}
                                        inverted={inverted}
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

    const displayAnswers = (data: AnswerWithQuiz[], count: number, loading: boolean) => {
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
                                    <ImageComponent
                                        alt={`${lang.history.sceneFrom} ${a.quiz.video.title} (${a.quiz.video.year})`}
                                        inverted={inverted}
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
                        onClick={() => setHistoryFilter("answers")}
                    >
                        {lang.history.answers}
                    </Menu.Item>
                    <Menu.Item
                        active={historyFilter === "quizzes"}
                        name="Quizzes"
                        onClick={() => setHistoryFilter("quizzes")}
                    >
                        {lang.history.quizzes}
                    </Menu.Item>
                </Menu>
                <Dimmer.Dimmable as={Segment} className="basic" dimmed={!isAuth}>
                    {historyFilter === "quizzes" && (
                        <>{displayQuizzes(quizzes.data, quizzes.count, quizzes.isLoading)}</>
                    )}
                    {historyFilter === "answers" && (
                        <>{displayAnswers(answers.data, answers.count, answers.isLoading)}</>
                    )}
                    <Dimmer
                        active={!isAuth}
                        inverted={!inverted}
                        onClickOutside={() => null}
                        verticalAlign="top"
                    ></Dimmer>
                </Dimmer.Dimmable>
            </ModalComponent>
        </div>
    )
}

export default HistoryModal
