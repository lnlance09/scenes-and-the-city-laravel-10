import "../index.scss"
import { useEffect } from "react"
import { Header, Segment, Table, Transition } from "semantic-ui-react"
import { setChar as setAdminChar, setChars as setAdminChars } from "../../../reducers/admin"
import { setChar, setChars } from "../../../reducers/form"
import { formatName } from "../../../utils/general"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const animation = "fade"
const duration = 600

const CharacterSearch = ({
    actorName = "",
    charName = "",
    charIsSelf = false,
    charsVisible = false,
    initialState = "form",
    onSelectChar = () => null,
    setActorName = () => null,
    setCharName = () => null,
    setCharIsSelf = () => null,
    setCharsVisible = () => null,
    videoId = null
}) => {
    const dispatch = useDispatch()
    const char = useSelector((state) => state[initialState].char)
    const chars = useSelector((state) => state[initialState].chars)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const charEmpty = char.id === null
    const visible = charsVisible && chars.length > 0

    const getCharacters = (videoId) => {
        axios({
            url: `${apiBaseUrl}chars/${videoId}`
        }).then((response) => {
            const { chars } = response.data.data
            if (initialState === "form") {
                dispatch(setChars({ chars }))
            }
            if (initialState === "admin") {
                dispatch(setAdminChars({ chars }))
            }
        })
    }

    const displayChars = (chars) => (
        <Table celled inverted={inverted} selectable striped>
            <Table.Body>
                {chars.map((c) => {
                    const charName = formatName(c)
                    const actorName = formatName(c.actor)

                    return (
                        <Table.Row
                            key={`${charName}-${c.id}`}
                            onClick={() => {
                                setCharIsSelf(c.firstName.toLowerCase() === "self")
                                setActorName(actorName)
                                setCharName(charName)
                                const char = {
                                    id: c.id,
                                    name: charName,
                                    actor: {
                                        id: c.actor.id,
                                        name: actorName
                                    }
                                }
                                if (initialState === "form") {
                                    dispatch(setChar({ char }))
                                }
                                if (initialState === "admin") {
                                    dispatch(setAdminChar({ char }))
                                }
                                setCharsVisible(false)
                                onSelectChar()
                            }}
                        >
                            <Table.Cell>
                                <Header inverted={inverted} size="small">
                                    {charIsSelf ? (
                                        <Header.Content>{actorName}</Header.Content>
                                    ) : (
                                        <Header.Content>
                                            {charName}
                                            <Header.Subheader>{actorName}</Header.Subheader>
                                        </Header.Content>
                                    )}
                                </Header>
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </Table>
    )

    useEffect(() => {
        if (videoId === null) {
            return
        }
        getCharacters(videoId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId])

    return (
        <div className="searchCharsComponent">
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
                                    {charName}
                                    <Header.Subheader>{actorName}</Header.Subheader>
                                </Header.Content>
                            </Header>
                        </Segment>
                    )}
                </div>
            </Transition>
            <Transition animation={animation} duration={duration} unmountOnHide visible={visible}>
                <div>{visible && displayChars(chars)}</div>
            </Transition>
        </div>
    )
}

CharacterSearch.propTypes = {
    actorName: PropTypes.string,
    charName: PropTypes.string,
    charIsSelf: PropTypes.bool,
    charsVisible: PropTypes.bool,
    initialState: PropTypes.string,
    onSelectChar: PropTypes.func,
    setActorName: PropTypes.func,
    setCharName: PropTypes.func,
    setCharIsSelf: PropTypes.func,
    setCharsVisible: PropTypes.func,
    videoId: PropTypes.number
}

export default CharacterSearch
