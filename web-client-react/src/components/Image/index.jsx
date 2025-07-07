import "./index.scss"
import {
    Container,
    Header,
    Icon,
    Image,
    Modal as SemanticModal,
    Transition,
    Placeholder
} from "semantic-ui-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { dateFormat, isSunday, nyc } from "../../utils/date"
import { translateMonth, translateWeekday } from "../../utils/translate"
import classNames from "classnames"
import moment from "moment-timezone"
import NotFoundSvg from "../../images/not-found.svg"
import NotFoundSvgInverted from "../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const duration = 400

const ImageSection = ({
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek = () => null,
    goToToday = () => null,
    isInFuture = false,
    isWeekend = isWeekend(),
    loading = true,
    quiz404 = false,
    validQuizId = false
}) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const quiz = useSelector((state) => state.home.quiz)
    const lang = translations[language]

    const [modalOpen, setModalOpen] = useState(false)

    const nycDate = moment(date).tz(nyc)
    const minusOneDay = moment(date).tz(nyc).subtract(1, "days")
    const plusOneDay = moment(date).tz(nyc).add(1, "days")
    const saturday = isSunday(date) ? minusOneDay : nycDate
    const sunday = isSunday(date) ? nycDate : plusOneDay
    const yearFormat = moment(date).format("YYYY")

    const day = moment(date).format("dddd")
    const month = moment(date).format("MMMM")
    const dayOfMonth = moment(date).format("DD")

    let title = `${translateWeekday(day, language)}, ${translateMonth(month, language)} ${dayOfMonth}, ${yearFormat}`
    if (isWeekend) {
        const satMonth = translateMonth(saturday.format("MMMM"), language)
        const sunMonth = translateMonth(sunday.format("MMMM"), language)
        const dateRange = `${satMonth} ${saturday.format("DD")} - ${sunMonth} ${sunday.format("DD")}`
        title = `${lang.main.weekendOf} ${dateRange}, ${yearFormat}`
    }

    const olderThanWeek = isSunday()
        ? moment().subtract(1, "days").week() - moment(date).subtract(1, "days").week() > 0
        : moment().week() - moment(date).week()
    const notFound = inverted ? NotFoundSvgInverted : NotFoundSvg

    const quizImg = () => (
        <>
            {loading ? (
                <Placeholder fluid inverted={inverted}>
                    <Placeholder.Image style={{ height: "360px" }} />
                </Placeholder>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <Image
                        alt="Scenes and the City"
                        centered
                        onClick={(i) => {
                            if (i.target.src === notFound) {
                                return
                            }
                            setModalOpen(true)
                        }}
                        onError={(i) => (i.target.src = notFound)}
                        rounded
                        style={{ height: "360px" }}
                        src={quiz.img === null || quiz404 ? notFound : quiz.img}
                    />
                </div>
            )}
        </>
    )

    const mainContainerClass = classNames({
        mainContainer: true,
        quiz: validQuizId,
        afterToday: isInFuture,
        quiz404: quiz404
    })

    return (
        <div className="imageSectionComponent">
            <Container className={mainContainerClass} text>
                <Header className="dateHeader" inverted={inverted} size="large">
                    {title}
                    {!validQuizId && (
                        <Header.Subheader>
                            <div className="navigatePrev" onClick={() => goToLastWeek(date)}>
                                <Icon inverted={inverted} name="arrow left circle" size="small" />
                                {lang.main.seeLastWeek}
                            </div>
                            {olderThanWeek && (
                                <div className="navigateToday" onClick={() => goToToday(date)}>
                                    <span>{lang.main.seeToday}</span>
                                    <Icon
                                        inverted={inverted}
                                        name="arrow right circle"
                                        size="small"
                                    />
                                </div>
                            )}
                            <div className="clearfix"></div>
                        </Header.Subheader>
                    )}
                    {validQuizId && quiz.quizId && (
                        <Header.Subheader>
                            By {quiz.username} - {moment(quiz.createdAt).tz(nyc).fromNow()}
                        </Header.Subheader>
                    )}
                </Header>
                <Transition animation="slide left" duration={duration} visible={true}>
                    <div>{quizImg()}</div>
                </Transition>
            </Container>
            <SemanticModal
                basic
                onClose={() => setModalOpen(false)}
                onOpen={() => setModalOpen(true)}
                open={modalOpen}
                size="large"
            >
                <SemanticModal.Content>
                    <Image alt="Scenes and the City" fluid src={quiz.img} />
                </SemanticModal.Content>
            </SemanticModal>
        </div>
    )
}

ImageSection.propTypes = {
    date: PropTypes.string,
    goToLastWeek: PropTypes.func,
    goToToday: PropTypes.func,
    isInFuture: PropTypes.bool,
    isWeekend: PropTypes.bool,
    loading: PropTypes.bool,
    quiz404: PropTypes.bool,
    validQuizId: PropTypes.bool
}

export default ImageSection
