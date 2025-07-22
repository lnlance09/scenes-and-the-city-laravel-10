import "./index.scss"
import { Dropdown, Flag, Form, Menu, Radio, Sidebar } from "semantic-ui-react"
import { useSelector, useDispatch } from "react-redux"
import {
    logout,
    setDarkMode,
    setHardMode,
    setLanguage,
    setReveal,
    setUnits
} from "../../reducers/app"
import { setHasAnswered } from "../../reducers/home"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import FooterComponent from "../Footer"
import classNames from "classnames"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const SidebarComponent = ({
    sidebarVisible = false,
    setHistoryItem = () => null,
    setSidebarVisible = () => null,
    setUploadModalOpen = () => null,
    setHistoryVisible = () => null,
    setStatsVisible = () => null,
    toggleLoginModal = () => null
}) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const hardMode = useSelector((state) => state.app.hardMode)
    const reveal = useSelector((state) => state.app.reveal)
    const units = useSelector((state) => state.app.units)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const updateSettings = (payload) => {
        fetch(`${apiBaseUrl}users/settings`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(payload),
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

    const setLanguageCallback = (lang) => {
        if (isAuth) {
            updateSettings({ lang })
        }
        dispatch(setLanguage({ language: lang }))
        localStorage.setItem("lang", lang)
    }

    const sidebarClass = classNames({
        sidebarComponent: true
    })

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
                                            updateSettings({ darkMode: data.checked ? 1 : 0 })
                                        }
                                        dispatch(setDarkMode({ darkMode: data.checked }))
                                        localStorage.setItem("inverted", data.checked ? 1 : 0)
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
                                        localStorage.setItem("hardMode", data.checked ? 1 : 0)
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
                                        localStorage.setItem("reveal", data.checked ? 1 : 0)
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
                                        updateSettings({ units: value })
                                        dispatch(setUnits({ units: value }))
                                        localStorage.setItem("units", value)
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
                                setHistoryVisible(true)
                                setHistoryItem("answers")
                            }}
                        >
                            {lang.history.answers}
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                setHistoryVisible(true)
                                setHistoryItem("quizzes")
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
                            localStorage.setItem("auth", 0)
                            localStorage.setItem("bearer", null)
                            localStorage.setItem("hardMode", 0)
                            localStorage.setItem("reveal", 0)
                            localStorage.setItem("units", "miles")
                            localStorage.setItem("user", JSON.stringify({}))
                            localStorage.setItem("verify", 0)
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
            <div style={{ padding: 0, position: "relative", bottom: 0, width: "100%" }}>
                <FooterComponent />
            </div>
        </div>
    )
}

SidebarComponent.propTypes = {
    setHistoryItem: PropTypes.func,
    setSidebarVisible: PropTypes.func,
    setUploadModalOpen: PropTypes.func,
    setHistoryVisible: PropTypes.func,
    setStatsVisible: PropTypes.func,
    toggleLoginModal: PropTypes.func
}

export default SidebarComponent
