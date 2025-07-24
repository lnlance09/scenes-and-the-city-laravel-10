import { Container, Header } from "semantic-ui-react"
import { formatMargin, formatName, formatPlural, wrapText } from "@utils/general"
import { Actor, ReduxState } from "@interfaces/index"
import { useSelector } from "react-redux"
import classNames from "classnames"
import Typewriter from "typewriter-effect"
import translations from "@assets/translate.json"

type Props = {
    loading?: boolean
    quiz404?: boolean
}

const QuestionSection = ({ loading = true, quiz404 = false }: Props) => {
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const partTwo = useSelector((state: ReduxState) => state.home.partTwo)
    const units = useSelector((state: ReduxState) => state.app.units)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const generateQuestion = () => {
        const { action, char, video } = quiz
        const year = video.year === null ? 2000 : video.year
        const charName = formatName(char as Actor)
        let text = `It's ${wrapText(`${year}`)} and ${wrapText(charName)} is seen here ${action}`
        if (partTwo === null) {
            return `${text}.`
        }

        const { action: action2, distance, char: char2 } = partTwo
        const charName2 = formatName(char2)
        const partTwoYear = partTwo.video.year
        const timing = partTwoYear > year ? "later" : "earlier"
        const phrase = partTwoYear > year ? "would be" : "was"
        const yearsDiff = partTwoYear > year ? partTwoYear - year : year - partTwoYear

        if (distance) {
            const distanceFormat = formatMargin(distance, units)
            const distanceEl = wrapText(`${distanceFormat.toPrecision(3)} ${units}`)
            text = `${text} - approximately ${distanceEl} away from`
        }

        text = `${text} where ${wrapText(charName2)} ${phrase} seen ${action2}`

        if (partTwoYear === year) {
            return `${text} during the same year.`
        }

        return `${text} ${wrapText(`${yearsDiff} ${formatPlural(yearsDiff, "year")} ${timing}`)}.`
    }

    const text = quiz404 ? lang.main.errorMessage : generateQuestion()

    const questionContainerClass = classNames({
        questionSectionComponent: true,
        quiz404,
        inverted
    })

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
                    >
                        <Typewriter
                            onInit={(typewriter) => typewriter.typeString(text).start()}
                            options={{ delay: 75 }}
                        />
                    </Header>
                )}
            </Container>
        </div>
    )
}

export default QuestionSection
