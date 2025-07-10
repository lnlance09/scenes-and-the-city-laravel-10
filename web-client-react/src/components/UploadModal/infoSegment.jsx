import "./index.scss"
import {
    Button,
    Divider,
    Dropdown,
    Form,
    Header,
    Icon,
    Image,
    Radio,
    Segment,
    Table,
    Transition
} from "semantic-ui-react"
import {
    addAction,
    setAction,
    clearChar,
    setChar,
    setChars,
    setVideo,
    setVideos
} from "../../reducers/form"
import { useSelector, useDispatch } from "react-redux"
import { DebounceInput } from "react-debounce-input"
import { filterTypes } from "../../options/filters"
import { isValidDate } from "../../utils/date"
import axios from "axios"
import moment from "moment-timezone"
import NotFoundSvg from "../../images/not-found.svg"
import NotFoundSvgInverted from "../../images/not-found-inverted.svg"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const animation = "fade"
const duration = 600

const InfoSegment = ({
    actionsVisible = false,
    actorName = "",
    charIsSelf = false,
    charsVisible = false,
    videosVisible = false,
    videoVal = "",
    videoType = 1,
    setActionsVisible = () => null,
    setActorName = () => null,
    setCharIsSelf = () => null,
    setCharsVisible = () => null,
    setVideosVisible = () => null,
    setVideoVal = () => null,
    setVideoType = () => null,
    callback = () => null
}) => {
    const dispatch = useDispatch()

    const action = useSelector((state) => state.form.action)
    const actions = useSelector((state) => state.form.actions)
    const char = useSelector((state) => state.form.char)
    const chars = useSelector((state) => state.form.chars)
    const video = useSelector((state) => state.form.video)
    const videos = useSelector((state) => state.form.videos)

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg
    const videoEmpty = video.id === null
    const charEmpty = char.id === null
    const actionEmpty = action.id === null

    const getVideos = (q, type = 5) => {
        setVideosVisible(false)
        axios({
            url: `${apiBaseUrl}videos?q=${q}&type=${type}`
        }).then((response) => {
            const { videos } = response.data.data
            dispatch(setVideos({ videos }))
            setVideosVisible(true)
        })
    }

    const getCharacters = (videoId) => {
        axios({
            url: `${apiBaseUrl}chars/${videoId}`
        }).then((response) => {
            const { chars } = response.data.data
            dispatch(setChars({ chars }))
        })
    }

    return (
        <Form inverted={inverted} size="large">
            <Form.Field>
                <Header
                    className="videoHeader"
                    content={lang.form.steps[1].headerOne}
                    inverted={inverted}
                />
                <div className={`ui left icon input fluid ${inverted ? "inverted" : ""}`}>
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
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={videosVisible}
                >
                    <div>
                        {videos.length > 0 && videosVisible && (
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
                                                dispatch(setVideo({ video }))
                                                dispatch(clearChar())
                                                getCharacters(v.id)
                                                setVideosVisible(false)
                                                setCharsVisible(true)
                                            }}
                                        >
                                            <Table.Cell>
                                                <Header inverted={inverted} size="small">
                                                    <Image
                                                        onError={(i) =>
                                                            (i.target.src = notFoundImg)
                                                        }
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
                        )}

                        {videos.length === 0 && videosVisible && (
                            <Segment
                                basic
                                className="noResults"
                                inverted={inverted}
                                textAlign="center"
                            >
                                <Header content={lang.form.steps[1].noResults} size="small" />
                            </Segment>
                        )}
                    </div>
                </Transition>
                {!videoEmpty && chars.length > 0 && <Divider hidden section />}
            </Form.Field>
            {/* Characters drop down */}
            <Form.Field>
                {chars.length > 0 && (
                    <Header className="charHeader" inverted={inverted}>
                        <Header.Content>
                            {lang.form.steps[1].headerTwo}
                            <Header.Subheader>
                                {!charEmpty && (
                                    <a href="#" onClick={() => setCharsVisible(true)}>
                                        {lang.form.steps[1].seeFullCast}
                                    </a>
                                )}
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                )}
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={!charEmpty}
                >
                    <div>
                        {!charEmpty && (
                            <Segment className="activeCharSegment" inverted={inverted} secondary>
                                <Header inverted={inverted} size="small">
                                    <Header.Content>
                                        {char.name}
                                        <Header.Subheader>{char.actor.name}</Header.Subheader>
                                    </Header.Content>
                                </Header>
                            </Segment>
                        )}
                    </div>
                </Transition>
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={charsVisible && chars.length > 0}
                >
                    <div>
                        {charsVisible && chars.length > 0 && (
                            <Table celled inverted={inverted} selectable striped>
                                <Table.Body>
                                    {chars.map((c) => {
                                        const { actor, firstName, lastName } = c
                                        const charName = `${firstName}${!lastName ? "" : " " + lastName}`
                                        const actorName = `${actor.firstName}${!actor.lastName ? "" : " " + actor.lastName}`
                                        return (
                                            <Table.Row
                                                key={`${charName}-${c.id}`}
                                                onClick={() => {
                                                    setCharIsSelf(
                                                        firstName.toLowerCase() === "self"
                                                    )
                                                    setActorName(actorName)
                                                    const char = {
                                                        id: c.id,
                                                        name: charName,
                                                        actor: {
                                                            id: actor.id,
                                                            name: actorName
                                                        }
                                                    }
                                                    dispatch(setChar({ char }))
                                                    setCharsVisible(false)
                                                    setActionsVisible(true)
                                                }}
                                            >
                                                <Table.Cell>
                                                    <Header inverted={inverted} size="small">
                                                        {charIsSelf ? (
                                                            <Header.Content>
                                                                {actorName}
                                                            </Header.Content>
                                                        ) : (
                                                            <Header.Content>
                                                                {charName}
                                                                <Header.Subheader>
                                                                    {actorName}
                                                                </Header.Subheader>
                                                            </Header.Content>
                                                        )}
                                                    </Header>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })}
                                </Table.Body>
                            </Table>
                        )}
                    </div>
                </Transition>
                {!videoEmpty && !charEmpty && actionsVisible && <Divider hidden section />}
            </Form.Field>
            <Form.Field>
                {actionsVisible && (
                    <>
                        <Header
                            className="actionHeader"
                            content={lang.form.steps[1].headerThree.replace(
                                "{name}",
                                charIsSelf
                                    ? actorName
                                    : char.name === null
                                      ? "this character"
                                      : char.name
                            )}
                            inverted={inverted}
                        />
                        <Dropdown
                            allowAdditions
                            className={inverted ? "inverted" : ""}
                            defaultUpward
                            fluid
                            maxLength={20} // Need to find out how to limit to 20
                            onAddItem={(e, { value }) => {
                                const action = {
                                    id: 0,
                                    key: value,
                                    name: value,
                                    text: value,
                                    value
                                }
                                dispatch(addAction({ action }))
                                dispatch(setAction({ action }))
                            }}
                            onChange={(e, { value }) => {
                                // NOT on keyup. This gets triggered when an item from the dropdown is clicked
                                const action = actions.find((a) => a.value === value)
                                if (action === undefined) {
                                    return
                                }
                                dispatch(
                                    setAction({
                                        action: {
                                            id: action.id,
                                            key: null,
                                            name: null,
                                            text: null,
                                            value: null
                                        }
                                    })
                                )
                            }}
                            options={actions}
                            placeholder={lang.form.steps[1].formThreePlaceholder}
                            search
                            selection
                            value={action.id === 0 ? action.value : action.id}
                        />
                    </>
                )}
            </Form.Field>
            <Form.Field>
                {!videoEmpty && !charEmpty && (
                    <Button
                        color={inverted ? "green" : "blue"}
                        content="Next"
                        disabled={actionEmpty}
                        fluid
                        inverted={inverted}
                        onClick={() => callback()}
                        size="large"
                    />
                )}
            </Form.Field>
        </Form>
    )
}

InfoSegment.propTypes = {
    actionsVisible: PropTypes.bool,
    actorName: PropTypes.string,
    callback: PropTypes.func,
    charIsSelf: PropTypes.bool,
    charsVisible: PropTypes.bool,
    videosVisible: PropTypes.bool,
    videoVal: PropTypes.string,
    videoType: PropTypes.bool,
    setActionsVisible: PropTypes.func,
    setActorName: PropTypes.func,
    setCharIsSelf: PropTypes.func,
    setCharsVisible: PropTypes.func,
    setVideosVisible: PropTypes.func,
    setVideoVal: PropTypes.func,
    setVideoType: PropTypes.func
}

export default InfoSegment
