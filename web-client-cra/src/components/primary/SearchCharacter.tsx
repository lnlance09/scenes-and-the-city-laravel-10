import { useEffect } from "react"
import { Header, Segment, Table, Transition } from "semantic-ui-react"
import { FullChar, ReduxState } from "@interfaces/index"
import { setChar as setAdminChar, setChars as setAdminChars } from "@reducers/admin"
import { setChar, setChars } from "@reducers/form"
import { formatName } from "@utils/general"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import translations from "@assets/translate.json"

const animation = "fade"
const duration = 600

type FormOrAdmin = "form" | "admin"
type Props = {
    actorName: string
    charName: string
    charIsSelf: boolean
    charsVisible: boolean
    initialState?: FormOrAdmin
    onSelectChar: () => any
    setActorName: (name: string) => any
    setCharName: (name: string) => any
    setCharIsSelf: (isSelf: boolean) => any
    setCharsVisible: (visible: boolean) => any
    videoId: number
}

const CharacterSearch = ({
    actorName,
    charName,
    charIsSelf,
    charsVisible,
    initialState = "form",
    onSelectChar,
    setActorName,
    setCharName,
    setCharIsSelf,
    setCharsVisible,
    videoId
}: Props) => {
    const dispatch = useDispatch()
    const char = useSelector((state: ReduxState) => state[initialState].char)
    const chars = useSelector((state: ReduxState) => state[initialState].chars)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const charEmpty = char.id === null
    const visible = charsVisible && chars.length > 0

    useEffect(() => {
        if (videoId === null) {
            return
        }
        getCharacters(videoId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId])

    const getCharacters = (videoId: number) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}chars/${videoId}`
        axios.get(url).then((response) => {
            const { chars } = response.data.data
            if (initialState === "form") {
                dispatch(setChars({ chars }))
            }
            if (initialState === "admin") {
                dispatch(setAdminChars({ chars }))
            }
        })
    }

    const displayChars = (chars: FullChar[]) => (
        <Table celled inverted={inverted} selectable size="large" striped>
            <Table.Body>
                {chars.map((c) => {
                    const charName = formatName(c)
                    const actorName = c.actor === null ? "" : formatName(c.actor)

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

    return (
        <div className="searchCharsComponent">
            {chars.length > 0 && (
                <Header className="charHeader" inverted={inverted} size="medium">
                    <Header.Content>
                        {lang.stepTwo.headerTwo}
                        <Header.Subheader>
                            {!charEmpty && (
                                // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                <a href="#" onClick={() => setCharsVisible(true)}>
                                    {lang.stepTwo.seeFullCast}
                                </a>
                            )}
                        </Header.Subheader>
                    </Header.Content>
                </Header>
            )}
            <Segment inverted={inverted}>
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={!charEmpty}
                >
                    <div>
                        {!charEmpty && (
                            <Segment className="activeCharSegment" inverted={inverted}>
                                <Header inverted={inverted} size="medium">
                                    <Header.Content>
                                        {charName}
                                        <Header.Subheader>{actorName}</Header.Subheader>
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
                    visible={visible}
                >
                    <div>{visible && displayChars(chars)}</div>
                </Transition>
            </Segment>
        </div>
    )
}

export default CharacterSearch
