import "../index.scss"
import { Divider, Header, Icon, Image, Segment, Table, Transition } from "semantic-ui-react"
import { setPartTwo, setQuizzes } from "../../../reducers/form"
import { translateDate } from "../../../utils/date"
import { useSelector, useDispatch } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import classNames from "classnames"
import NotFoundSvg from "../../../images/not-found.svg"
import NotFoundSvgInverted from "../../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const animation = "fade"
const duration = 600

const QuizSearch = ({
    onSelectQuiz = () => null,
    quizVal = "",
    quizzesVisible = false,
    setQuizVal = () => null,
    setQuizzesVisible = () => null
}) => {
    const dispatch = useDispatch()

    const partTwo = useSelector((state) => state.form.partTwo)
    const quizzes = useSelector((state) => state.form.quizzes)

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg
    const partTwoEmpty = partTwo === null
    const visible = quizzes.length > 0 && quizzesVisible

    const getQuizzes = (q) => {
        setQuizzesVisible(false)
        fetch(`${apiBaseUrl}users/quizzes?q=${q}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`
            }
        })
            .then((response) => response.json())
            .then((response) => {
                const { quizzes } = response.data
                dispatch(setQuizzes({ quizzes }))
                setQuizzesVisible(true)
            })
    }

    const displayQuizzes = (quizzes) => (
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
                            <Header inverted={inverted} size="small">
                                <Image
                                    alt={`Scene from ${quiz.video.title} (${quiz.video.year})`}
                                    onError={(i) => (i.target.src = notFoundImg)}
                                    rounded
                                    size="small"
                                    src={quiz.img}
                                />
                                <Header.Content>
                                    {`Scene from ${quiz.video.title} (${quiz.video.year})`}
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
                    placeholder={lang.form.steps[1].formOnePlaceholder}
                    value={quizVal}
                />
            </div>
            {!partTwoEmpty && (
                <Segment className="activePartTwoHeader" inverted={inverted}>
                    <Header inverted={inverted} size="small">
                        <Image
                            alt={`Scene from ${partTwo.video.title} (${partTwo.video.year})`}
                            onError={(i) => (i.target.src = notFoundImg)}
                            rounded
                            size="small"
                            src={partTwo.img}
                        />
                        <Header.Content>
                            {`Scene from ${partTwo.video.title} (${partTwo.video.year})`}
                            <Header.Subheader>
                                {translateDate(partTwo.createdAt, language)}
                            </Header.Subheader>
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
                            <Header content={lang.form.steps[1].noResults} size="small" />
                        </Segment>
                    )}
                </div>
            </Transition>
        </div>
    )
}

QuizSearch.propTypes = {
    onSelectQuiz: PropTypes.func,
    quizzesVisible: PropTypes.bool,
    quizVal: PropTypes.string,
    setQuizVal: PropTypes.func,
    setQuizzesVisible: PropTypes.func
}

export default QuizSearch
