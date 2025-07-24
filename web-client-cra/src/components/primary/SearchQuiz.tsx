import { Divider, Header, Icon, Segment, Table, Transition } from "semantic-ui-react"
import { setPartTwo, setQuizzes } from "@reducers/form"
import { translateDate } from "@utils/date"
import { useSelector, useDispatch } from "react-redux"
import { Quiz, ReduxState } from "@interfaces/index"
import { DebounceInput } from "react-debounce-input"
import axios from "axios"
import classNames from "classnames"
import ImageComponent from "./Image"
import translations from "@assets/translate.json"

const animation = "fade"
const duration = 600

type Props = {
    onSelectQuiz: () => any
    quizVal: string
    quizzesVisible?: boolean
    setQuizVal: (val: string) => any
    setQuizzesVisible: (visible: boolean) => any
}

const QuizSearch = ({
    onSelectQuiz,
    quizVal,
    quizzesVisible = false,
    setQuizVal,
    setQuizzesVisible
}: Props) => {
    const dispatch = useDispatch()
    const partTwo = useSelector((state: ReduxState) => state.form.partTwo)
    const quizzes = useSelector((state: ReduxState) => state.form.quizzes)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const partTwoEmpty = partTwo === null
    const visible = quizzes.length > 0 && quizzesVisible

    const getQuizzes = (q: string) => {
        setQuizzesVisible(false)
        const url = `${process.env.REACT_APP_API_BASE_URL}users/quizzes`
        axios
            .get(`${url}?q=${q}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then((response) => {
                const { quizzes } = response.data.data
                dispatch(setQuizzes({ quizzes }))
                setQuizzesVisible(true)
            })
    }

    const displayQuizzes = (quizzes: Quiz[]) => (
        <Table celled inverted={inverted} selectable striped>
            <Table.Body>
                {quizzes.map((quiz) => (
                    <Table.Row
                        key={quiz.id}
                        onClick={() => {
                            dispatch(setPartTwo({ partTwo: quiz }))
                            setQuizzesVisible(false)
                            onSelectQuiz()
                        }}
                    >
                        <Table.Cell>
                            <Header inverted={inverted} size="tiny">
                                <ImageComponent
                                    alt={`Scene from ${quiz.video.title} (${quiz.video.year})`}
                                    inverted={inverted}
                                    size="large"
                                    src={quiz.img}
                                />
                                <Header.Content>
                                    {`${quiz.video.title} (${quiz.video.year})`}
                                    <Header.Subheader>
                                        {translateDate(quiz.createdAt, language)}
                                    </Header.Subheader>
                                </Header.Content>
                            </Header>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    )

    const inputClass = classNames({
        ui: true,
        left: true,
        icon: true,
        input: true,
        fluid: true,
        large: true,
        inverted
    })

    return (
        <div className="searchQuizzesComponent">
            <div className={inputClass}>
                <Icon name="film" />
                <DebounceInput
                    debounceTimeout={500}
                    minLength={1}
                    onChange={(e) => {
                        const val = e.target.value
                        setQuizVal(val)
                        getQuizzes(val)
                    }}
                    placeholder={lang.stepTwo.formOnePlaceholder}
                    value={quizVal}
                />
            </div>
            {!partTwoEmpty && (
                <Segment className="activePartTwoHeader" inverted={inverted}>
                    <Header inverted={inverted} size="tiny">
                        <ImageComponent
                            alt={`Scene from ${partTwo.video.title} (${partTwo.video.year})`}
                            inverted={inverted}
                            size="small"
                            src={partTwo.img}
                        />
                        <Header.Content>
                            {`Scene from ${partTwo.video.title} (${partTwo.video.year})`}
                            {partTwo.createdAt && (
                                <Header.Subheader>
                                    {translateDate(partTwo.createdAt, language)}
                                </Header.Subheader>
                            )}
                        </Header.Content>
                    </Header>
                </Segment>
            )}
            {!partTwoEmpty && quizzesVisible && <Divider hidden />}
            {/* Quizzes Drop Down */}
            <Transition animation={animation} duration={duration} unmountOnHide visible={visible}>
                <div>
                    {visible && displayQuizzes(quizzes)}
                    {quizzes.length === 0 && quizzesVisible && (
                        <Segment basic className="noResults" inverted={inverted} textAlign="center">
                            <Header content={lang.stepTwo.noResults} size="small" />
                        </Segment>
                    )}
                </div>
            </Transition>
        </div>
    )
}

export default QuizSearch
