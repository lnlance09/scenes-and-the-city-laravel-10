import "../index.scss"
import { Button, Divider, Dropdown, Form, Header } from "semantic-ui-react"
import { addAction, clearChar, setAction } from "../../../reducers/form"
import { useSelector, useDispatch } from "react-redux"
import PropTypes from "prop-types"
import CharacterSearch from "../../Search/Character"
import VideoSearch from "../../Search/Video"
import * as translations from "../../../assets/translate.json"

const InfoSegment = ({
    actionsVisible = false,
    actorName = "",
    charName = "",
    charIsSelf = false,
    charsVisible = false,
    videoType = 1,
    videoVal = "",
    videosVisible = false,
    setActionsVisible = () => null,
    setActorName = () => null,
    setCharName = () => null,
    setCharIsSelf = () => null,
    setCharsVisible = () => null,
    setVideoType = () => null,
    setVideoVal = () => null,
    setVideosVisible = () => null,
    callback = () => null
}) => {
    const dispatch = useDispatch()

    const action = useSelector((state) => state.form.action)
    const actions = useSelector((state) => state.form.actions)
    const char = useSelector((state) => state.form.char)
    const video = useSelector((state) => state.form.video)

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const videoEmpty = video.id === null
    const charEmpty = char.id === null
    const actionEmpty = action.id === null

    return (
        <Form inverted={inverted} size="large">
            <Form.Field>
                <Header
                    className="videoHeader"
                    content={lang.form.steps[1].headerOne}
                    inverted={inverted}
                />
                <VideoSearch
                    onSelectVideo={(v) => {
                        dispatch(clearChar())
                        setCharsVisible(true)
                    }}
                    setVideoType={(visible) => setVideoType(visible)}
                    setVideoVal={(visible) => setVideoVal(visible)}
                    setVideosVisible={(visible) => setVideosVisible(visible)}
                    videoType={videoType}
                    videoVal={videoVal}
                    videosVisible={videosVisible}
                />
            </Form.Field>
            {/* Characters drop down */}
            <Form.Field>
                <CharacterSearch
                    actorName={actorName}
                    charName={charName}
                    charIsSelf={charIsSelf}
                    charsVisible={charsVisible}
                    onSelectChar={() => setActionsVisible(true)}
                    setActorName={(name) => setActorName(name)}
                    setCharName={(name) => setCharName(name)}
                    setCharIsSelf={(isSelf) => setCharIsSelf(isSelf)}
                    setCharsVisible={(visible) => setCharsVisible(visible)}
                    videoId={video.id}
                />
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
                        content={lang.form.steps[1].submitBtn}
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
    charName: PropTypes.string,
    callback: PropTypes.func,
    charIsSelf: PropTypes.bool,
    charsVisible: PropTypes.bool,
    videoType: PropTypes.string,
    videoVal: PropTypes.string,
    videosVisible: PropTypes.bool,
    setActionsVisible: PropTypes.func,
    setActorName: PropTypes.func,
    setCharName: PropTypes.func,
    setCharIsSelf: PropTypes.func,
    setCharsVisible: PropTypes.func,
    setVideoVal: PropTypes.func,
    setVideosVisible: PropTypes.func,
    setVideoType: PropTypes.func
}

export default InfoSegment
