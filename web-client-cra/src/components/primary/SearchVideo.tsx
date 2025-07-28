import { Divider, Header, Icon, Radio, Segment, Table } from "semantic-ui-react"
import { setVideo as setAdminVideo, setVideos as setAdminVideos } from "@reducers/admin"
import { ReduxState, Video } from "@interfaces/index"
import { TranslationBlock } from "@interfaces/translations"
import { setVideo, setVideos } from "@reducers/form"
import { useSelector, useDispatch } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import { filterTypes } from "@options/filters"
import { isValidDate, nyc, tsFormat } from "@utils/date"
import { DateTime } from "luxon"
import axios from "axios"
import classNames from "classnames"
import ImageComponent from "./Image"
import translations from "@assets/translate.json"
import queryString from "query-string"

type StateType = "form" | "admin"
type Props = {
    initialState?: StateType
    onSelectVideo: () => any
    videoType?: number
    videoVal: string
    videosVisible?: boolean
    setVideoType: (type: number) => any
    setVideoVal: (type: string) => any
    setVideosVisible: (visible: boolean) => any
}

const VideoSearch = ({
    initialState = "form",
    onSelectVideo,
    videoType = 1,
    videoVal,
    videosVisible = false,
    setVideoType,
    setVideoVal,
    setVideosVisible
}: Props) => {
    const dispatch = useDispatch()
    const video = useSelector((state: ReduxState) => state[initialState].video)
    const videos = useSelector((state: ReduxState) => state[initialState].videos)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang: TranslationBlock = translations[language]

    const videoEmpty = video.id === null
    const visible = videos.length > 0 && videosVisible
    const step = lang.stepTwo

    const getVideos = (q: string, type = 5) => {
        setVideosVisible(false)
        const url = `${process.env.REACT_APP_API_BASE_URL}videos`
        const qs = queryString.stringify({ q, type })
        axios.get(`${url}?${qs}`).then((response) => {
            const { videos } = response.data.data
            if (initialState === "form") {
                dispatch(setVideos({ videos }))
            }
            if (initialState === "admin") {
                dispatch(setAdminVideos({ videos }))
            }
            setVideosVisible(true)
        })
    }

    const displayVideos = (videos: Video[]) => (
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
                            onSelectVideo()
                        }}
                    >
                        <Table.Cell>
                            <Header inverted={inverted} size="small">
                                <ImageComponent inverted={inverted} src={v.img} />
                                <Header.Content>
                                    {v.title}
                                    <Header.Subheader>
                                        {`${v.year}${isValidDate(v.releaseDate) ? ` • ${DateTime.fromFormat(v.releaseDate, tsFormat).setZone(nyc).toRelative()}` : ""}`}
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
                    placeholder={step.formOnePlaceholder}
                    value={videoVal}
                />
            </div>
            <div style={{ margin: "1em 0" }}>
                {filterTypes.map((filter, i) => {
                    return (
                        <Radio
                            checked={videoType === filter.value}
                            key={step.filters[i]}
                            label={step.filters[i]}
                            name="videoType"
                            onChange={(e, { value }) => {
                                if (typeof value !== "number") {
                                    return
                                }
                                setVideoType(value)
                                getVideos(videoVal, value)
                            }}
                            value={filter.value}
                        />
                    )
                })}
            </div>
            {!videoEmpty && (
                <Segment inverted={inverted} size="small">
                    <Header className="videoItemHeader" inverted={inverted}>
                        <ImageComponent
                            alt={video.title !== null ? video.title : ""}
                            inverted={inverted}
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
            <div>{visible && displayVideos(videos)}</div>
            {videos.length === 0 && videosVisible && (
                <Segment className="noResults" inverted={inverted} placeholder textAlign="center">
                    <Header content={step.noResults} size="small" />
                </Segment>
            )}
        </div>
    )
}

export default VideoSearch
