import { Button, Divider, Dropdown, Form, Header, Segment } from "semantic-ui-react"
import { addAction, clearChar, setAction } from "@reducers/form"
import { useSelector, useDispatch } from "react-redux"
import { ReduxState } from "@interfaces/index"
import CharacterSearch from "@components/primary/SearchCharacter"
import VideoSearch from "@components/primary/SearchVideo"
import translations from "@assets/translate.json"

type Props = {
    actionsVisible: boolean
    actorName: string
    charName: string
    charIsSelf: boolean
    charsVisible: boolean
    videoType: number
    videoVal: string
    videosVisible: boolean
    setActionsVisible: (visible: boolean) => any
    setActorName: (name: string) => any
    setCharName: (name: string) => any
    setCharIsSelf: (isSelf: boolean) => any
    setCharsVisible: (visible: boolean) => any
    setVideoType: (type: number) => any
    setVideoVal: (value: string) => any
    setVideosVisible: (visible: boolean) => any
    callback: () => any
}

const InfoSegment = ({
    actionsVisible,
    actorName,
    charName,
    charIsSelf,
    charsVisible,
    videoType,
    videoVal,
    videosVisible,
    setActionsVisible,
    setActorName,
    setCharName,
    setCharIsSelf,
    setCharsVisible,
    setVideoType,
    setVideoVal,
    setVideosVisible,
    callback
}: Props) => {
    const dispatch = useDispatch()

    const action = useSelector((state: ReduxState) => state.form.action)
    const actions = useSelector((state: ReduxState) => state.form.actions)
    const char = useSelector((state: ReduxState) => state.form.char)
    const video = useSelector((state: ReduxState) => state.form.video)

    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const videoEmpty = video.id === null
    const charEmpty = char.id === null
    const actionEmpty = action.id === null

    let actionVal: string | number = action.id as number
    if (action.id === 0 || action.id === null) {
        actionVal = action.value as string
    }

    const realCharName = charIsSelf ? actorName : char.name === null ? "this character" : char.name

    return (
        <Form inverted={inverted} size="large" stacked>
            <Form.Field>
                <Header
                    className="videoHeader"
                    content={lang.stepTwo.headerOne}
                    inverted={inverted}
                    size="medium"
                />
                <Segment inverted={inverted}>
                    <VideoSearch
                        onSelectVideo={() => {
                            dispatch(clearChar())
                            setCharsVisible(true)
                        }}
                        setVideoType={(type) => setVideoType(type)}
                        setVideoVal={(val) => setVideoVal(val)}
                        setVideosVisible={(visible) => setVideosVisible(visible)}
                        videoType={videoType}
                        videoVal={videoVal}
                        videosVisible={videosVisible}
                    />
                </Segment>
                <Divider hidden section />
            </Form.Field>
            {/* Characters drop down */}
            {video.id && (
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
                    <Divider hidden section />
                </Form.Field>
            )}
            <Form.Field>
                {actionsVisible && (
                    <>
                        <Header
                            className="actionHeader"
                            content={lang.stepTwo.headerThree.replace("{name}", realCharName)}
                            inverted={inverted}
                            size="medium"
                        />
                        <Segment inverted={inverted}>
                            <Dropdown
                                allowAdditions
                                className={inverted ? "inverted" : ""}
                                defaultUpward
                                fluid
                                maxLength={50} // Need to find out how to limit to 20
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
                                placeholder={lang.stepTwo.formThreePlaceholder}
                                search
                                selection
                                value={actionVal}
                            />
                        </Segment>
                    </>
                )}
            </Form.Field>
            <Form.Field>
                {!videoEmpty && !charEmpty && (
                    <Button
                        color={inverted ? "green" : "blue"}
                        content={lang.stepTwo.submitBtn}
                        disabled={actionEmpty}
                        fluid
                        inverted={inverted}
                        onClick={() => callback()}
                        size="big"
                    />
                )}
            </Form.Field>
        </Form>
    )
}

export default InfoSegment
