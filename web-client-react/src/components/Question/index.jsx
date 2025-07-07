import "./index.scss"
import { Container, Header } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { Typewriter } from "react-simple-typewriter"
import classNames from "classnames"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const QuestionSection = ({ loading = true, quiz404 = false }) => {
    const quizText = useSelector((state) => state.home.quiz.text)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const questionContainerClass = classNames({
        questionSectionComponent: true,
        quiz404,
        inverted
    })

    return (
        <div className={questionContainerClass}>
            <Container>
                <Header
                    className="questionHeader"
                    id="questionHeader"
                    inverted={inverted}
                    size="huge"
                    textAlign="center"
                >
                    {!loading && (
                        <Typewriter
                            cursor
                            cursorBlinking
                            cursorStyle={<span className="cursorGreen">|</span>}
                            words={[quiz404 ? lang.main.errorMessage : quizText]}
                        />
                    )}
                </Header>
            </Container>
        </div>
    )
}

QuestionSection.propTypes = {
    loading: PropTypes.bool,
    quiz404: PropTypes.bool
}

export default QuestionSection
