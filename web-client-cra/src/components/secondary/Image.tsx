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
import ImageComponent, { ImageSize } from "../primary/Image"
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
    const partTwo = useSelector((state: ReduxState) => state.home.partTwo)
    const lang = translations[language]

    const [modalOpen, setModalOpen] = useState(false)
    const [modalImg, setModalImg] = useState("")

    const { createdAt, video, youtubeId } = quiz
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

    const notFoundImg = inverted ? `not-found-inverted` : `not-found`

    const mainImg = (img: string, size: ImageSize) => (
        <ImageComponent
            callback={() => {
                if (useDefaultImg) {
                    return
                }
                setModalOpen(true)
                setModalImg(img)
            }}
            centered
            inverted={inverted}
            size={size}
            src={img}
        />
    )

    return (
        <div className="imageSectionComponent">
            <Container className={mainContainerClass} text>
                {/* HEADER */}
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
                        {/* If the quiz is searched by date, then show navigation links */}
                        {!validQuizId && (
                            <Header.Subheader>
                                <div className="navigatePrev" onClick={() => goToLastWeek(date)}>
                                    <Icon inverted={inverted} name="arrow left" size="small" />
                                    {lang.main.seeLastWeek}
                                </div>
                                {now.weekNumber > dateWeekYear && (
                                    <div className="navigateToday" onClick={() => goToToday(date)}>
                                        <span>{lang.main.seeToday}</span>
                                        <Icon inverted={inverted} name="arrow right" size="small" />
                                    </div>
                                )}
                                <div className="clearfix"></div>
                            </Header.Subheader>
                        )}
                        {/* If the quiz has a valid id in the url, show who it was created by */}
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

                {/* IMAGE */}
                {loading ? (
                    <Placeholder fluid inverted={inverted}>
                        <Placeholder.Image style={{ height: "360px" }} />
                    </Placeholder>
                ) : (
                    <Transition
                        animation={animation}
                        duration={loading ? 0 : 700}
                        visible={imgVisible && !loading}
                    >
                        <div>
                            {partTwo ? (
                                <div className="photoStack">
                                    {quiz.img && (
                                        <Segment className="imageWrapper" inverted={inverted}>
                                            {mainImg(quiz.img, "large")}
                                        </Segment>
                                    )}
                                    {partTwo.img && (
                                        <Segment className="imageWrapper" inverted={inverted}>
                                            {mainImg(partTwo.img, "large")}
                                        </Segment>
                                    )}
                                </div>
                            ) : (
                                <Segment className="imageWrapper" inverted={inverted} padded="very">
                                    {mainImg(
                                        quiz.img ? quiz.img : `images/${notFoundImg}.png`,
                                        "large"
                                    )}
                                </Segment>
                            )}
                            {!hardMode && video.title && video.img && video.year && (
                                <>
                                    <Divider inverted={inverted} section />
                                    <Segment inverted={inverted}>
                                        {youtubeId && (
                                            <>
                                                <iframe
                                                    width="100%"
                                                    height="315"
                                                    src={`https://www.youtube.com/embed/${youtubeId}?si=WsHl5CdIHUtlEg3X&amp;controls=0`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                    referrerPolicy="strict-origin-when-cross-origin"
                                                    allowFullScreen
                                                ></iframe>
                                                <Divider inverted={inverted} />
                                            </>
                                        )}
                                        <Segment inverted={inverted} size="small">
                                            <Header
                                                className="videoItemHeader"
                                                inverted={inverted}
                                                size="large"
                                            >
                                                <ImageComponent
                                                    alt={video.title}
                                                    inverted={inverted}
                                                    src={video.img}
                                                />
                                                <Header.Content>
                                                    {video.title}
                                                    <Header.Subheader>
                                                        {video.year}
                                                    </Header.Subheader>
                                                </Header.Content>
                                            </Header>
                                        </Segment>
                                    </Segment>
                                </>
                            )}
                        </div>
                    </Transition>
                )}
            </Container>
            <ModalComponent callback={() => setModalOpen(false)} open={modalOpen} size="large">
                <Image alt="Scenes and the City" bordered fluid rounded src={modalImg} />
            </ModalComponent>
        </div>
    )
}

export default ImageSection
