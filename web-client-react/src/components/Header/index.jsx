import "./index.scss"
import {
    Button,
    Container,
    Dropdown,
    Flag,
    Form,
    Grid,
    Icon,
    Image,
    Label,
    Menu,
    Radio,
    Segment,
    Sidebar
} from "semantic-ui-react"
import { useEffect, useState } from "react"
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
import { languages } from "../../options/languages"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import { dateFormat, isSunday, nyc } from "../../utils/date"
import axios from "axios"
import avatarPic from "../../images/avatar/small/zoe.jpg"
import avatarPicInverted from "../../images/avatar/small/nan.jpg"
import HistoryModal from "./modals/historyModal"
import StatsModal from "./modals/statsModal"
import classNames from "classnames"
import moment from "moment-timezone"
import PropTypes from "prop-types"
import UploadModal from "../UploadModal/"
import WordsLogo from "../../images/logo.svg"
import WordsLogoInverted from "../../images/logo-inverted.svg"
import WordsLogoEs from "../../images/logo-es.svg"
import WordsLogoInvertedEs from "../../images/logo-es-inverted.svg"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const HeaderComponent = ({
    date,
    onClickDate = () => {},
    onClickLogo = () => {},
    toggleLoginModal = () => null,
    showDates = true
}) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const points = useSelector((state) => state.app.user.points)
    const hardMode = useSelector((state) => state.app.hardMode)
    const reveal = useSelector((state) => state.app.reveal)
    const units = useSelector((state) => state.app.units)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [sidebarVisible, setSidebarVisible] = useState(false)

    const [statsVisible, setStatsVisible] = useState(false)
    const [historyVisible, setHistoryVisible] = useState(false)
    const [historyItem, setHistoryItem] = useState("answers")
    const [logo, setLogo] = useState("")

    const days = lang.days
    const lastIndex = days.length - 1
    const weekend = days[lastIndex]
    const btnColor = inverted ? "green" : "blue"

    const m = moment(date).tz(nyc)
    const startWeek = (isSunday(date) ? m.subtract(1, "days") : m).startOf("week").add(1, "days")
    const sat = moment(startWeek, dateFormat).add(5, "days")
    const sun = moment(startWeek, dateFormat).add(6, "days")

    useEffect(() => {
        if (language === "en" || language == "cn") {
            setLogo(inverted ? WordsLogoInverted : WordsLogo)
        }
        if (language === "es") {
            setLogo(inverted ? WordsLogoInvertedEs : WordsLogoEs)
        }
    }, [inverted, language])

    const updateSettings = (payload) => {
        axios
            .post(`${apiBaseUrl}users/settings`, payload, {
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

    const headerClass = classNames({
        headerComponent: true
    })

    return (
        <div className={headerClass}>
            <Menu className="headerMenu" inverted={inverted} pointing secondary>
                <Container>
                    <div className="brandName">
                        {logo !== "" && (
                            <img
                                alt="Scenes and the City"
                                id="logo"
                                onClick={() => onClickLogo()}
                                src={logo}
                            />
                        )}
                        {inverted ? (
                            <Icon
                                color="green"
                                inverted
                                name="options"
                                onClick={() => setSidebarVisible(true)}
                                size="large"
                            />
                        ) : (
                            <Icon
                                inverted
                                name="options"
                                onClick={() => setSidebarVisible(true)}
                                size="large"
                            />
                        )}
                    </div>
                    <div className="floatedRight">
                        <Menu.Item className="menuItem lang">
                            <div>
                                <Dropdown
                                    className="inverted"
                                    defaultValue={language}
                                    icon={null}
                                    item
                                    onChange={(e, { value }) => setLanguageCallback(value)}
                                    options={languages}
                                    pointing
                                    trigger={<Flag name={language === "en" ? "us" : language} />}
                                    value={language}
                                />
                            </div>
                        </Menu.Item>
                        <Menu.Item
                            className="menuItem"
                            onClick={() => {
                                if (isAuth) {
                                    updateSettings({ darkMode: !inverted ? 1 : 0 })
                                }
                                dispatch(setDarkMode({ darkMode: !inverted }))
                                localStorage.setItem("inverted", !inverted ? 1 : 0)
                            }}
                        >
                            {inverted ? (
                                <Icon color="green" inverted name="sun" />
                            ) : (
                                <Icon inverted name="moon" />
                            )}
                        </Menu.Item>
                        <Menu.Item
                            className="menuItem settings"
                            onClick={() => setSidebarVisible(true)}
                        >
                            {isAuth ? (
                                <>
                                    <Label
                                        className="pointLabel"
                                        color={inverted ? "green" : "blue"}
                                        circular
                                        content={points}
                                        floating
                                        size="mini"
                                    />
                                    <Image avatar src={inverted ? avatarPicInverted : avatarPic} />
                                </>
                            ) : (
                                <>
                                    {inverted ? (
                                        <Icon color="green" inverted name="options" />
                                    ) : (
                                        <Icon inverted name="options" />
                                    )}
                                </>
                            )}
                        </Menu.Item>
                        <Menu.Item className="menuItem">
                            <Button
                                color={btnColor}
                                content={lang.header.makeAQuiz}
                                fluid
                                inverted={inverted}
                                onClick={() => setUploadModalOpen(true)}
                            />
                        </Menu.Item>
                    </div>
                </Container>
            </Menu>
            {showDates && (
                <Grid
                    as={Segment}
                    basic
                    className="headerGrid"
                    celled="internally"
                    columns="equal"
                    inverted={inverted}
                    stackable
                    textAlign="center"
                >
                    <Grid.Row>
                        {days.map((d, i) => {
                            // Leave the logic for the weekend in its own block
                            if (i === lastIndex) {
                                return
                            }
                            const weekdate = moment(startWeek).tz(nyc).add(i, "days")
                            return (
                                <Grid.Column
                                    className={weekdate.isSame(date, "day") ? "active" : ""}
                                    key={d}
                                    onClick={() => onClickDate(weekdate.format(dateFormat))}
                                >
                                    {d}
                                    <p className="dateSubHeader">{weekdate.format("MM/DD")}</p>
                                </Grid.Column>
                            )
                        })}
                        <Grid.Column
                            className={
                                sat.isSame(date, "day") || sun.isSame(date, "day") ? "active" : ""
                            }
                            onClick={() => onClickDate(sat.format(dateFormat))}
                        >
                            {weekend}
                            <p className="dateSubHeader">
                                {sat.format("MM/DD")} + {sun.format("MM/DD")}
                            </p>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )}
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

            <UploadModal modalOpen={uploadModalOpen} setModalOpen={setUploadModalOpen} />
            <StatsModal
                callback={(visible) => setStatsVisible(visible)}
                modalOpen={statsVisible}
                updateSettings={(data) => updateSettings(data)}
            />
            <HistoryModal
                activeItem={historyItem}
                callback={(visible) => setHistoryVisible(visible)}
                modalOpen={historyVisible}
                updateSettings={(data) => updateSettings(data)}
            />
        </div>
    )
}

HeaderComponent.propTypes = {
    date: PropTypes.string,
    onClickDate: PropTypes.func,
    onClickLogo: PropTypes.func,
    showDates: PropTypes.bool,
    toggleLoginModal: PropTypes.func
}

export default HeaderComponent
