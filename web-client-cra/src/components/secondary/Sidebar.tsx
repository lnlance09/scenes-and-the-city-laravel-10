import {
    Container,
    Dropdown,
    Flag,
    Form,
    Header,
    Image,
    List,
    Menu,
    Radio,
    Segment,
    Sidebar
} from "semantic-ui-react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { ClassNames, Language, ReduxState, UnitsUpdate } from "@interfaces/index"
import { resetSessionData } from "@utils/auth"
import { capitalize } from "@utils/general"
import { logout, setDarkMode, setHardMode, setLanguage, setReveal, setUnits } from "@reducers/app"
import { resetHistoryAnswers, resetHistoryQuizzes, setHasAnswered } from "@reducers/home"
import { TranslationBlock } from "@interfaces/translations"
import { toast } from "react-toastify"
import { toastConfig } from "@options/toast"
import avatarPic from "@images/avatar/small/zoe.jpg"
import avatarPicInverted from "@images/avatar/small/nan.jpg"
import axios from "axios"
import classNames from "classnames"
import ModalComponent from "@components/primary/Modal"
import translations from "@assets/translate.json"

type FooterItem = "about" | "rules" | "privacy"

type Props = {
    loginModalOpen: boolean
    sidebarVisible: boolean
    setHistoryItem: (item: string) => any
    setSidebarVisible: (visible: boolean) => any
    setUploadModalOpen: (open: boolean) => any
    setHistoryVisible: (visible: boolean) => any
    setStatsVisible: (visible: boolean) => any
    toggleLoginModal: (visible: boolean) => any
}

const SidebarComponent = ({
    loginModalOpen,
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
    const user = useSelector((state: ReduxState) => state.app.user)
    const hardMode = useSelector((state: ReduxState) => state.app.hardMode)
    const reveal = useSelector((state: ReduxState) => state.app.reveal)
    const units = useSelector((state: ReduxState) => state.app.units)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang: TranslationBlock = translations[language]

    const [footerItem, setFooterItem] = useState<FooterItem>("about")
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

    const aboutSection = (
        <>
            <Header as="p" content={lang.aboutBlockOne} inverted={inverted} size="small" />
            <Header as="p" content={lang.aboutBlockTwo} inverted={inverted} size="small" />
            <Segment inverted={inverted}>
                <iframe
                    width="100%"
                    height="315"
                    src="https://www.youtube.com/embed/Zd8vzIRQLLM?si=WsHl5CdIHUtlEg3X&amp;controls=0"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </Segment>
            <Header as="p" content={lang.aboutBlockThree} inverted={inverted} size="small" />
        </>
    )

    const privacySection = (
        <>
            <Header as="p" content={lang.privacy} inverted={inverted} size="small" />
        </>
    )

    const rulesSection = (
        <>
            <Header as="p" content={lang.rulesBlockOne} inverted={inverted} size="small" />
            <Header as="p" content={lang.rulesBlockTwo} inverted={inverted} size="small" />
            <Header as="p" content={lang.rulesBlockThree} inverted={inverted} size="small" />
            <Header as="p" content={lang.rulesBlockFour} inverted={inverted} size="small" />
        </>
    )

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
                <Menu.Item>
                    <Header
                        className="createQuizHeader"
                        inverted={inverted}
                        onClick={() => setUploadModalOpen(true)}
                    >
                        {isAuth && (
                            <Image
                                circular
                                size="big"
                                src={inverted ? avatarPicInverted : avatarPic}
                            />
                        )}
                        <Header.Content>
                            {lang.header.makeAQuiz}
                            {isAuth && <Header.Subheader>{user.username}</Header.Subheader>}
                        </Header.Content>
                    </Header>
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
                            resetSessionData()
                            dispatch(logout())
                            dispatch(setHasAnswered({ hasAnswered: false }))
                            dispatch(resetHistoryQuizzes())
                            dispatch(resetHistoryAnswers())
                            toast.success("You have been logged out!", toastConfig)
                        }}
                    >
                        {lang.auth.signOut}
                    </Menu.Item>
                ) : (
                    <Menu.Item as="a" onClick={() => toggleLoginModal(!loginModalOpen)}>
                        {lang.auth.signIn}
                    </Menu.Item>
                )}
            </Sidebar>
            <Sidebar
                animation="scale down"
                className="footerSidebar"
                direction="left"
                inverted={inverted}
                size="massive"
                vertical
                visible={sidebarVisible}
            >
                <Container textAlign="center" style={{ position: "absolute", bottom: 0 }}>
                    <List horizontal inverted={inverted} size="large">
                        <List.Item onClick={() => onClickFooter("about")}>
                            {lang.footer.about}
                        </List.Item>
                        <List.Item onClick={() => onClickFooter("rules")}>
                            {lang.footer.rules}
                        </List.Item>
                        <List.Item onClick={() => onClickFooter("privacy")}>
                            {lang.footer.privacy}
                        </List.Item>
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
                className={{ footerModal: true }}
                callback={() => setModalOpen(false)}
                open={modalOpen}
            >
                <Header as="h2" inverted={inverted} content={capitalize(lang.footer[footerItem])} />
                {footerItem === "about" && <>{aboutSection}</>}
                {footerItem === "privacy" && <>{privacySection}</>}
                {footerItem === "rules" && <>{rulesSection}</>}
            </ModalComponent>
        </div>
    )
}

export default SidebarComponent
