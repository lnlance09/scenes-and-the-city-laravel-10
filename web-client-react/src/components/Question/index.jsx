import "./index.scss"
import { Container, Header } from "semantic-ui-react"
import {
    formatMargin,
    formatName,
    formatPlural,
    typeWriterEffect,
    wrapText
} from "../../utils/general"
import { useSelector } from "react-redux"
import { useEffect } from "react"
import classNames from "classnames"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const QuestionSection = ({ loading = true, quiz404 = false }) => {
    const quiz = useSelector((state) => state.home.quiz)
    const partTwo = useSelector((state) => state.home.partTwo)
    const units = useSelector((state) => state.app.units)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    useEffect(() => {
        if (loading) {
            return
        }

        const text = loading ? "" : quiz404 ? lang.main.errorMessage : generateQuestion()
        typeWriterEffect("questionHeader", text)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, quiz404, units])

    const questionContainerClass = classNames({
        questionSectionComponent: true,
        quiz404,
        inverted
    })

    const generateQuestion = () => {
        const { action, char, video } = quiz
        const year = video.year
        const charName = formatName(char)
        let text = `It's ${wrapText(year)} and ${wrapText(charName)} is seen here ${action}`
        if (partTwo === null) {
            return `${text}.`
        }

        const { action: action2, distance, char: char2 } = partTwo
        const charName2 = formatName(char2)
        const partTwoYear = partTwo.video.year
        const timing = partTwoYear > year ? "later" : "earlier"
        const phrase = partTwoYear > year ? "would be" : "was"
        const yearsDiff = partTwoYear > year ? partTwoYear - year : partTwoYear - year
        const distanceFormat = formatMargin(distance, units)
        const distanceEl = wrapText(`${distanceFormat.toPrecision(3)} ${units}`)

        text = `${text} - approximately ${distanceEl} away from where ${wrapText(charName2)} ${phrase} seen ${action2}`
        if (partTwoYear === year) {
            return `${text} during the same year.`
        }

        return `${text} ${wrapText(`${yearsDiff} ${formatPlural(yearsDiff, "year")} ${timing}`)}.`
    }

    return (
        <div className={questionContainerClass}>
            <Container>
                {!loading && (
                    <Header
                        className="questionHeader"
                        id="questionHeader"
                        inverted={inverted}
                        size="huge"
                        textAlign="center"
                    />
                )}
            </Container>
        </div>
    )
}

QuestionSection.propTypes = {
    loading: PropTypes.bool,
    quiz404: PropTypes.bool
}

export default QuestionSection
