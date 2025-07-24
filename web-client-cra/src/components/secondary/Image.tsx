import { Container, Divider, Header, Icon, Image, Placeholder, Transition } from "semantic-ui-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { ReduxState } from "@interfaces/index"
import { dateFormat, isSunday, nyc, translateDate } from "@utils/date"
import { capitalize } from "@utils/general"
import classNames from "classnames"
import ImageComponent from "../primary/Image"
import ModalComponent from "../primary/Modal"
import moment from "moment-timezone"
import translations from "@assets/translate.json"

type Props = {
    animation?: string
    date?: string
    goToLastWeek: (date: string) => any
    goToToday: (date: string) => any
    imgVisible: boolean
    isInFuture: boolean
    isWeekend: boolean
    loading: boolean
    quiz404: boolean
    validQuizId: boolean
}

const ImageSection = ({
    animation = "fly left",
    date = moment().tz(nyc).format(dateFormat),
    goToLastWeek,
    goToToday,
    imgVisible = false,
    isInFuture = false,
    isWeekend = false,
    loading = true,
    quiz404 = false,
    validQuizId = false
}: Props) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const lang = translations[language]

    const [modalOpen, setModalOpen] = useState(false)

    const title = translateDate(date, language, isWeekend, lang.main.weekendOf)
    const olderThanWeek = isSunday()
        ? moment().subtract(1, "days").week() - moment(date).subtract(1, "days").week() > 0
        : moment().week() - moment(date).week() > 0
    const useDefaultImg = quiz.img === null || quiz404

    const mainContainerClass = classNames({
        mainContainer: true,
        quiz: validQuizId,
        afterToday: isInFuture,
        quiz404
    })

    return (
        <div className="imageSectionComponent">
            <Container className={mainContainerClass} text>
                {loading ? (
                    <>
                        <Placeholder fluid inverted={inverted} style={{ height: "60px" }}>
                            <Placeholder.Image />
                        </Placeholder>
                        <Divider hidden />
                    </>
                ) : (
                    <Header className="dateHeader" inverted={inverted} size="large">
                        {((!quiz404 && validQuizId) || !validQuizId) && title}
                        {!validQuizId && (
                            <Header.Subheader>
                                <div className="navigatePrev" onClick={() => goToLastWeek(date)}>
                                    <Icon inverted={inverted} name="arrow left" size="small" />
                                    {lang.main.seeLastWeek}
                                </div>
                                {olderThanWeek && (
                                    <div className="navigateToday" onClick={() => goToToday(date)}>
                                        <span>{lang.main.seeToday}</span>
                                        <Icon inverted={inverted} name="arrow right" size="small" />
                                    </div>
                                )}
                                <div className="clearfix"></div>
                            </Header.Subheader>
                        )}
                        {validQuizId && !quiz404 && quiz.id && (
                            <Header.Subheader>
                                {capitalize(lang.main.by)} {quiz.username} -{" "}
                                {moment(quiz.createdAt).tz(nyc).fromNow()}
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
                            <ImageComponent
                                callback={() => {
                                    if (useDefaultImg) {
                                        return
                                    }
                                    setModalOpen(true)
                                }}
                                centered
                                inverted={inverted}
                                style={{ minHeight: "360px" }}
                                src={quiz.img}
                            />
                        )}
                    </div>
                </Transition>
            </Container>
            <ModalComponent callback={() => setModalOpen(false)} open={modalOpen} size="large">
                <Image alt="Scenes and the City" bordered fluid rounded src={quiz.img} />
            </ModalComponent>
        </div>
    )
}

export default ImageSection
