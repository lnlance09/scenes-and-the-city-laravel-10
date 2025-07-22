import {
    Container,
    Dropdown,
    Flag,
    Form,
    Header,
    List,
    Menu,
    Radio,
    Segment,
    Sidebar
} from "semantic-ui-react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { ClassNames, Language, ReduxState, UnitsUpdate } from "@interfaces/index"
import { capitalize } from "@/utils/general"
import { logout, setDarkMode, setHardMode, setLanguage, setReveal, setUnits } from "@reducers/app"
import { setHasAnswered } from "@reducers/home"
import { toast } from "react-toastify"
import { toastConfig } from "@options/toast"
import axios from "axios"
import classNames from "classnames"
import ModalComponent from "@components/primary/Modal"
import translations from "@assets/translate.json"

type FooterItem = "about" | "rules" | "privacy"

type Props = {
    sidebarVisible: boolean
    setHistoryItem: (item: string) => any
    setSidebarVisible: (visible: boolean) => any
    setUploadModalOpen: (open: boolean) => any
    setHistoryVisible: (visible: boolean) => any
    setStatsVisible: (visible: boolean) => any
    toggleLoginModal: () => any
}

const SidebarComponent = ({
    sidebarVisible,
    setHistoryItem,
    setSidebarVisible,
    setUploadModalOpen,
    setHistoryVisible,
    setStatsVisible,
    toggleLoginModal
}: Props) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const hardMode = useSelector((state: ReduxState) => state.app.hardMode)
    const reveal = useSelector((state: ReduxState) => state.app.reveal)
    const units = useSelector((state: ReduxState) => state.app.units)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const [footerItem, setFooterItem] = useState("")
    const [modalOpen, setModalOpen] = useState(false)

    const updateSettings = (payload: ClassNames | UnitsUpdate) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}users/settings`
        axios
            .post(url, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`
                }
            })
            .then(() => {
                console.log("Updated settings")
            })
            .catch((error) => {
                console.error(error.response.data.message)
            })
    }

    const setLanguageCallback = (lang: Language) => {
        if (isAuth) {
            updateSettings({ lang })
        }
        dispatch(setLanguage({ language: lang }))
        localStorage.setItem("lang", lang)
    }

    const sidebarClass = classNames({ sidebarComponent: true })

    const onClickFooter = (item: FooterItem) => {
        setFooterItem(item)
        setModalOpen(true)
    }

    return (
        <div className={sidebarClass}>
            <Sidebar
                animation="scale down"
                as={Menu}
                direction="left"
                icon="labeled"
                inverted={inverted}
                onHide={() => setSidebarVisible(false)}
                size="massive"
                style={{ textAlign: "left" }}
                vertical
                visible={sidebarVisible}
            >
                <Menu.Item
                    as="a"
                    className="createQuizHeader"
                    onClick={() => setUploadModalOpen(true)}
                >
                    {lang.header.makeAQuiz}
                </Menu.Item>
                <Menu.Item>
                    {lang.header.settings}
                    <Menu.Menu>
                        <Menu.Item>
                            {lang.settings.darkMode}
                            <Form size="tiny" style={{ float: "right " }}>
                                <Radio
                                    checked={inverted}
                                    onChange={(e, data) => {
                                        if (isAuth) {
                                            updateSettings({
                                                darkMode: data.checked ? 1 : 0
                                            })
                                        }
                                        dispatch(setDarkMode({ darkMode: data.checked }))
                                        localStorage.setItem("inverted", data.checked ? "1" : "0")
                                    }}
                                    toggle
                                />
                            </Form>
                            <div className="clearfix"></div>
                        </Menu.Item>
                        <Menu.Item>
                            {lang.settings.hardMode}
                            <Form size="tiny" style={{ float: "right " }}>
                                <Radio
                                    checked={hardMode}
                                    onChange={(e, data) => {
                                        updateSettings({ hardMode: data.checked ? 1 : 0 })
                                        dispatch(setHardMode({ hardMode: data.checked }))
                                        localStorage.setItem("hardMode", data.checked ? "1" : "0")
                                    }}
                                    toggle
                                />
                            </Form>
                            <div className="clearfix"></div>
                        </Menu.Item>
                        <Menu.Item>
                            {lang.settings.revealAnswers}
                            <Form size="tiny" style={{ float: "right " }}>
                                <Radio
                                    checked={reveal}
                                    onChange={(e, data) => {
                                        updateSettings({ reveal: data.checked ? 1 : 0 })
                                        dispatch(setReveal({ reveal: data.checked }))
                                        localStorage.setItem("reveal", data.checked ? "1" : "0")
                                    }}
                                    toggle
                                />
                            </Form>
                        </Menu.Item>
                        <Menu.Item style={{ marginTop: "0.5em" }}>
                            {lang.settings.units}
                            <Form size="small" style={{ float: "right " }}>
                                <Dropdown
                                    direction="left"
                                    onChange={(e, { value }) => {
                                        updateSettings({ units: `${value}` })
                                        dispatch(setUnits({ units: value }))
                                        localStorage.setItem("units", `${value}`)
                                    }}
                                    inline
                                    options={[
                                        { key: "miles", value: "miles", text: "miles" },
                                        {
                                            key: "kilometers",
                                            value: "kilometers",
                                            text: "kilometers"
                                        }
                                    ]}
                                    value={units}
                                />
                            </Form>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                <Menu.Item>
                    {lang.header.history}
                    <Menu.Menu>
                        <Menu.Item
                            onClick={() => {
                                setHistoryItem("answers")
                                setHistoryVisible(true)
                            }}
                        >
                            {lang.history.answers}
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setHistoryItem("quizzes")
                                setHistoryVisible(true)
                            }}
                        >
                            {lang.history.quizzes}
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                <Menu.Item>
                    {lang.header.language}
                    <Menu.Menu>
                        <Menu.Item
                            active={language === "en"}
                            onClick={() => setLanguageCallback("en")}
                        >
                            English <Flag name="us" />
                        </Menu.Item>
                        <Menu.Item
                            active={language === "es"}
                            onClick={() => setLanguageCallback("es")}
                        >
                            Español <Flag name="es" />
                        </Menu.Item>
                        <Menu.Item
                            active={language === "cn"}
                            onClick={() => setLanguageCallback("cn")}
                        >
                            官话 <Flag name="cn" />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu.Item>
                <Menu.Item as="a" onClick={() => setStatsVisible(true)}>
                    {lang.header.stats}
                </Menu.Item>
                {isAuth ? (
                    <Menu.Item
                        as="a"
                        onClick={() => {
                            localStorage.setItem("auth", "0")
                            localStorage.setItem("bearer", "")
                            localStorage.setItem("hardMode", "0")
                            localStorage.setItem("reveal", "0")
                            localStorage.setItem("units", "miles")
                            localStorage.setItem("user", JSON.stringify({}))
                            localStorage.setItem("verify", "0")
                            dispatch(logout())
                            dispatch(setHasAnswered({ hasAnswered: false }))
                            toast.success("You have been logged out!", toastConfig)
                        }}
                    >
                        {lang.auth.signOut}
                    </Menu.Item>
                ) : (
                    <Menu.Item as="a" onClick={() => toggleLoginModal()}>
                        {lang.auth.signIn}
                    </Menu.Item>
                )}
            </Sidebar>
            <Sidebar
                animation="scale down"
                className="footerSidebar"
                direction="left"
                inverted={inverted}
                onHide={() => setSidebarVisible(false)}
                size="massive"
                vertical
                visible={sidebarVisible}
            >
                <Container textAlign="center" style={{ position: "absolute", bottom: 0 }}>
                    <List horizontal inverted={inverted} size="large">
                        <List.Item onClick={() => onClickFooter("about")}>About</List.Item>
                        <List.Item onClick={() => onClickFooter("rules")}>Rules</List.Item>
                        <List.Item onClick={() => onClickFooter("privacy")}>Privacy</List.Item>
                    </List>
                    <Header
                        content="&copy; 2025 Scenes and the City"
                        inverted={inverted}
                        size="tiny"
                        textAlign="center"
                    />
                </Container>
            </Sidebar>

            <ModalComponent
                className={{
                    footerModal: true
                }}
                callback={() => setModalOpen(false)}
                open={modalOpen}
            >
                <Header as="h2" inverted={inverted} content={capitalize(footerItem)} />
                {footerItem === "about" && (
                    <>
                        <Header as="p" inverted={inverted} size="small">
                            Scenes and the City was created in 2025 after I unintentionally viewed a
                            then 21 year old clip from the TV show Law & Order. A perennial favorite
                            amongst fans of the cop drama genre, it's certainly no secret to
                            longtime viewers that the show has been filmed in NYC. It's been on the
                            air for well over year thirty years and thoughout the years an
                            astonishingly large number of both famous and infamous acrors and
                            actresses have appeared as cast members on the show.
                        </Header>
                        <Header as="p" inverted={inverted} size="small">
                            The particular clip that inspired me to create this app doesn't really
                            feature any good actors or actresses though - unless you consider Ice-T
                            a good actor and he's more of a rapper than an actor anyways. Despite
                            the incredibly cheesy dialogue and the overly dramatic sound effects
                            that accompany it, the most glaring thing that stood out to me was the
                            red skyscraper in tbe background. I had seen it before. I knew it. I was
                            100% positive. It was on the Upper West Side. I just wasn't quite sure
                            where yet...
                        </Header>
                        <Segment inverted={inverted}>
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/Zd8vzIRQLLM?si=WsHl5CdIHUtlEg3X&amp;controls=0"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </Segment>
                        <Header as="p" inverted={inverted} size="small">
                            And then I sort of had an epiphany moment. And, no. In case you're
                            wondering, I'm not gay. I promise! Anyways, though... it began to dawn
                            on me that so many movies and TV shows have been filmed in NYC even
                            dating back to the 50's. There's something about the concrete jungle and
                            its grit and its grime that simply cannot be replicated by any of the
                            Hollywood studios. That's why the opening shots of the TV show Friends
                            prominently feature an old building in the West Village but they only
                            film the interior scenes in LA. Same with All in the Family.There's an
                            energy and an atmoshphere in Manhattan than can't be replicated anywhere
                            else.
                        </Header>
                    </>
                )}
                {footerItem === "privacy" && (
                    <>
                        <Header as="p" inverted={inverted} size="small">
                            The only information that this app collects are your quizzes, guesses,
                            and some very basic information about each user (username, email, and
                            their settings like dark mode, hard mode, language, etc...) There is no
                            advertising on this site.
                        </Header>
                    </>
                )}
                {footerItem === "rules" && <></>}
            </ModalComponent>
        </div>
    )
}

export default SidebarComponent
