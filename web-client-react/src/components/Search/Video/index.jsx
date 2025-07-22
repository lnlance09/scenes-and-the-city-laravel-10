import "../index.scss"
import { Divider, Header, Icon, Image, Radio, Segment, Table, Transition } from "semantic-ui-react"
import { setVideo as setAdminVideo, setVideos as setAdminVideos } from "../../../reducers/admin"
import { setVideo, setVideos } from "../../../reducers/form"
import { useSelector, useDispatch } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import { filterTypes } from "../../../options/filters"
import { isValidDate } from "../../../utils/date"
import classNames from "classnames"
import moment from "moment-timezone"
import NotFoundSvg from "../../../images/not-found.svg"
import NotFoundSvgInverted from "../../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const animation = "fade"
const duration = 600

const VideoSearch = ({
    initialState = "form",
    onSelectVideo = () => null,
    videoType = 1,
    videoVal = "",
    videosVisible = false,
    setVideoType = () => null,
    setVideoVal = () => null,
    setVideosVisible = () => null
}) => {
    const dispatch = useDispatch()

    const video = useSelector((state) => state[initialState].video)
    const videos = useSelector((state) => state[initialState].videos)

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg
    const videoEmpty = video.id === null
    const visible = videos.length > 0 && videosVisible

    const getVideos = (q, type = 5) => {
        setVideosVisible(false)
        fetch(`${apiBaseUrl}videos?q=${q}&type=${type}`)
            .then((response) => response.json())
            .then((response) => {
                const { videos } = response.data
                if (initialState === "form") {
                    dispatch(setVideos({ videos }))
                }
                if (initialState === "admin") {
                    dispatch(setAdminVideos({ videos }))
                }
                setVideosVisible(true)
            })
    }

    const displayVideos = (videos) => (
        <Table celled inverted={inverted} selectable striped>
            <Table.Body>
                {videos.map((v) => (
                    <Table.Row
                        key={v.id}
                        onClick={() => {
                            const video = {
                                id: v.id,
                                img: v.img,
                                title: v.title,
                                year: v.year
                            }
                            if (initialState === "form") {
                                dispatch(setVideo({ video }))
                            }
                            if (initialState === "admin") {
                                dispatch(setAdminVideo({ video }))
                            }
                            setVideosVisible(false)
                            onSelectVideo(v)
                        }}
                    >
                        <Table.Cell>
                            <Header inverted={inverted} size="small">
                                <Image
                                    onError={(i) => (i.target.src = notFoundImg)}
                                    rounded
                                    src={v.img}
                                />
                                <Header.Content>
                                    {v.title}
                                    <Header.Subheader>
                                        {`${v.year}${isValidDate(v.releaseDate) ? ` • ${moment(v.releaseDate).fromNow()}` : ""}`}
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
        inverted
    })

    return (
        <div className="searchVideosComponent">
            <div className={inputClass}>
                <Icon name="film" />
                <DebounceInput
                    debounceTimeout={500}
                    minLength={1}
                    onChange={(e) => {
                        const val = e.target.value
                        setVideoVal(val)
                        getVideos(val, videoType)
                    }}
                    placeholder={lang.form.steps[1].formOnePlaceholder}
                    value={videoVal}
                />
            </div>
            <div style={{ margin: "1em 0" }}>
                {filterTypes.map((filter, i) => (
                    <Radio
                        checked={videoType === filter.value}
                        key={lang.form.steps[1].filters[i]}
                        label={lang.form.steps[1].filters[i]}
                        name="videoType"
                        onChange={(e, { value }) => {
                            setVideoType(value)
                            getVideos(videoVal, value)
                        }}
                        value={filter.value}
                    />
                ))}
            </div>
            {!videoEmpty && (
                <Segment inverted={inverted}>
                    <Header className="videoItemHeader" inverted={inverted} size="small">
                        <Image
                            alt={video.title}
                            onError={(i) => (i.target.src = notFoundImg)}
                            rounded
                            src={video.img}
                        />
                        <Header.Content>
                            {video.title}
                            <Header.Subheader>{video.year}</Header.Subheader>
                        </Header.Content>
                    </Header>
                </Segment>
            )}
            {!videoEmpty && videosVisible && <Divider hidden />}
            {/* Video Drop Down */}
            <Transition animation={animation} duration={duration} unmountOnHide visible={visible}>
                <div>
                    {visible && displayVideos(videos)}
                    {videos.length === 0 && videosVisible && (
                        <Segment basic className="noResults" inverted={inverted} textAlign="center">
                            <Header content={lang.form.steps[1].noResults} size="small" />
                        </Segment>
                    )}
                </div>
            </Transition>
        </div>
    )
}

VideoSearch.propTypes = {
    initialState: PropTypes.string,
    onSelectVideo: PropTypes.func,
    setVideosVisible: PropTypes.func,
    setVideoVal: PropTypes.func,
    setVideoType: PropTypes.func,
    videosVisible: PropTypes.bool,
    videoVal: PropTypes.string,
    videoType: PropTypes.number
}

export default VideoSearch
