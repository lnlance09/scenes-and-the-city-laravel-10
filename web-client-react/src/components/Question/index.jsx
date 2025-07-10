import "./index.scss"
import { Container, Header } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { useEffect } from "react"
import classNames from "classnames"
import PropTypes from "prop-types"
import Typewriter from "typewriter-effect/dist/core"
import * as translations from "../../assets/translate.json"

const QuestionSection = ({ loading = true, quiz404 = false }) => {
    const quiz = useSelector((state) => state.home.quiz)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    useEffect(() => {
        if (loading) {
            return
        }
        const text = loading ? "" : quiz404 ? lang.main.errorMessage : generateQuestion()
        const header = document.getElementById("questionHeader")
        const typewriter = new Typewriter(header, {
            delay: 75
        })
        typewriter.typeString(text).start()
    }, [loading, quiz404])

    const questionContainerClass = classNames({
        questionSectionComponent: true,
        quiz404,
        inverted
    })

    const generateQuestion = () => {
        const { char, video } = quiz
        const charName = `${char.firstName} ${char.lastName}`
        const year = `<span class="underline">${video.year}</span>`
        const charEl = `<span class="underline">${charName}</span>`
        return `It's ${year} and ${charEl} is seen here ${quiz.action}`
    }

    return (
        <div className={questionContainerClass}>
            <Container>
                <Header
                    className="questionHeader"
                    id="questionHeader"
                    inverted={inverted}
                    size="huge"
                    textAlign="center"
                />
            </Container>
        </div>
    )
}

QuestionSection.propTypes = {
    loading: PropTypes.bool,
    quiz404: PropTypes.bool
}

export default QuestionSection
