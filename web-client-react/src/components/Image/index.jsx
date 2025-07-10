import "./index.scss"
import {
    Container,
    Header,
    Icon,
    Image,
    Transition,
    Placeholder,
    Divider,
    Segment
} from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { dateFormat, isSunday, nyc, translateDate } from "../../utils/date"
import classNames from "classnames"
import ModalComponent from "../Header/modals/modal"
import moment from "moment-timezone"
import NotFoundSvg from "../../images/not-found.svg"
import NotFoundSvgInverted from "../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const ImageSection = ({
    animation = "slide left",
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek = () => null,
    goToToday = () => null,
    imgVisible = false,
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
    const [notFound, setNotFound] = useState(NotFoundSvg)

    useEffect(() => {
        setNotFound(inverted ? NotFoundSvgInverted : NotFoundSvg)
    }, [inverted])

    const title = translateDate(date, language, isWeekend, lang.main.weekendOf)
    const olderThanWeek = isSunday()
        ? moment().subtract(1, "days").week() - moment(date).subtract(1, "days").week() > 0
        : moment().week() - moment(date).week() > 0

    const mainContainerClass = classNames({
        mainContainer: true,
        quiz: validQuizId,
        afterToday: isInFuture,
        quiz404: quiz404
    })

    return (
        <div className="imageSectionComponent">
            <Container className={mainContainerClass} text>
                {loading ? (
                    <>
                        <Segment basic={!inverted} inverted={inverted}>
                            <Placeholder fluid inverted={inverted}>
                                <Placeholder.Header>
                                    <Placeholder.Line length="very long" />
                                    <Placeholder.Line length="long" />
                                </Placeholder.Header>
                            </Placeholder>
                        </Segment>
                        <Divider hidden />
                    </>
                ) : (
                    <Header className="dateHeader" inverted={inverted} size="large">
                        {title}
                        {!validQuizId && (
                            <Header.Subheader>
                                <div className="navigatePrev" onClick={() => goToLastWeek(date)}>
                                    <Icon
                                        inverted={inverted}
                                        name="arrow left circle"
                                        size="small"
                                    />
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
                )}
                {loading && (
                    <Placeholder fluid inverted={inverted}>
                        <Placeholder.Image style={{ height: "360px" }} />
                    </Placeholder>
                )}
                <Transition animation={animation} duration={400} visible={imgVisible}>
                    <div>
                        {imgVisible && (
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
                                style={{ minHeight: "360px" }}
                                src={quiz.img === null || quiz404 ? notFound : quiz.img}
                            />
                        )}
                    </div>
                </Transition>
            </Container>
            <ModalComponent basic callback={() => setModalOpen(false)} open={modalOpen}>
                <Image alt="Scenes and the City" fluid src={quiz.img} />
            </ModalComponent>
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
