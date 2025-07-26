import {
    Container,
    Divider,
    Header,
    Icon,
    Image,
    Placeholder,
    Segment,
    Transition
} from "semantic-ui-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { ReduxState } from "@interfaces/index"
import { dateFormat, nyc, translateDate, tsFormat } from "@utils/date"
import { DateTime } from "luxon"
import { capitalize } from "@utils/general"
import classNames from "classnames"
import ImageComponent from "../primary/Image"
import ModalComponent from "../primary/Modal"
import translations from "@assets/translate.json"

type Props = {
    animation: string
    date: string
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
    animation,
    date,
    goToLastWeek,
    goToToday,
    imgVisible = false,
    isInFuture = false,
    loading = true,
    quiz404 = false,
    validQuizId = false
}: Props) => {
    const hardMode = useSelector((state: ReduxState) => state.app.hardMode)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const quiz = useSelector((state: ReduxState) => state.home.quiz)
    const lang = translations[language]

    const [modalOpen, setModalOpen] = useState(false)

    const { createdAt, video } = quiz
    const title = translateDate(date, language, lang.main.weekendOf)
    const now = DateTime.now().setZone(nyc)
    const dateWeekYear = DateTime.fromFormat(date, dateFormat).setZone(nyc).weekNumber
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
                                {now.weekNumber > dateWeekYear && !loading && (
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
                                {createdAt && (
                                    <>
                                        {DateTime.fromFormat(createdAt, tsFormat)
                                            .setZone(nyc)
                                            .toRelative()}
                                    </>
                                )}
                            </Header.Subheader>
                        )}
                    </Header>
                )}
                {loading && (
                    <Placeholder fluid inverted={inverted}>
                        <Placeholder.Image style={{ height: "360px" }} />
                    </Placeholder>
                )}
                <Transition
                    animation={animation}
                    duration={loading ? 0 : 700}
                    visible={imgVisible && !loading}
                >
                    <div style={{ width: "100%", minHeight: "360px" }}>
                        <ImageComponent
                            callback={() => {
                                if (useDefaultImg) {
                                    return
                                }
                                setModalOpen(true)
                            }}
                            centered
                            inverted={inverted}
                            src={quiz.img}
                        />
                        {!hardMode && video.title && video.img && video.year && (
                            <>
                                <Divider inverted={inverted} />
                                <Segment inverted={inverted} size="small">
                                    <Header className="videoItemHeader" inverted={inverted}>
                                        <ImageComponent
                                            alt={video.title}
                                            inverted={inverted}
                                            src={video.img}
                                        />
                                        <Header.Content>
                                            {video.title}
                                            <Header.Subheader>{video.year}</Header.Subheader>
                                        </Header.Content>
                                    </Header>
                                </Segment>
                            </>
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
