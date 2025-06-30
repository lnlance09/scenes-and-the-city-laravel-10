import "./index.scss"
import { Modal } from "react-responsive-modal"
import {
    Button,
    Container,
    Dropdown,
    Flag,
    Grid,
    Header,
    Icon,
    Menu,
    Segment,
    Sidebar
} from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setLanguage, toggleInverted } from "../../reducers/app"
import { languages } from "../../options/languages"
import { options } from "../../options/options"
import { dateFormat, isSunday, nyc } from "../../utils/date"
import classNames from "classnames"
import moment from "moment-timezone"
import PropTypes from "prop-types"
import UploadModal from "../UploadModal/"
import WordsLogo from "../../images/logo.svg"
import WordsLogoInverted from "../../images/logo-inverted.svg"
import * as translations from "../../assets/translate.json"

const HeaderComponent = ({
    date,
    onClickDate = () => {},
    onClickLogo = () => {},
    toggleLoginModal = () => null,
    showDates = true
}) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    let translatedOptions = options(language)
    const optCount = translatedOptions.length

    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [sidebarVisible, setSidebarVisible] = useState(false)

    const [leaderboardVisible, setLeaderboardVisible] = useState(false)
    const [statsVisible, setStatsVisible] = useState(false)
    const [historyVisible, setHistoryVisible] = useState(false)
    const [settingsVisible, setSettingsVisible] = useState(false)

    const [dropdownVal, setDropdownVal] = useState(translatedOptions[optCount - 1].value)

    const days = lang.days
    const lastIndex = days.length - 1
    const weekend = days[lastIndex]

    const m = moment(date).tz(nyc)
    const startWeek = (isSunday(date) ? m.subtract(1, "days") : m).startOf("week").add(1, "days")
    const sat = moment(startWeek, dateFormat).add(5, "days")
    const sun = moment(startWeek, dateFormat).add(6, "days")

    const btnColor = inverted ? "green" : "black"

    useEffect(() => {
        if (isAuth) {
            translatedOptions.pop()
            translatedOptions.push({})
        }
    }, [isAuth])

    const modalClass = classNames({
        loginModal: true,
        simpleModal: true,
        inverted
    })
    const modalOverlayClass = classNames({
        loginModalOverlay: true,
        simpleModalOverlay: true,
        inverted
    })

    const settingsModal = () => {
        return (
            <Modal
                classNames={{
                    overlay: modalOverlayClass,
                    modal: modalClass
                }}
                center
                onClose={() => setSettingsVisible(false)}
                onOpen={() => setSettingsVisible(true)}
                open={settingsVisible}
                showCloseIcon={false}
            >
                <Header content="Settings" inverted={inverted} />
            </Modal>
        )
    }

    const statsModal = () => {
        return (
            <Modal
                classNames={{
                    overlay: modalOverlayClass,
                    modal: modalClass
                }}
                center
                onClose={() => setStatsVisible(false)}
                onOpen={() => setStatsVisible(true)}
                open={statsVisible}
                showCloseIcon={false}
            >
                <Header content="Stats" inverted={inverted} />
            </Modal>
        )
    }

    const historyModal = () => {
        return (
            <Modal
                classNames={{
                    overlay: modalOverlayClass,
                    modal: modalClass
                }}
                center
                onClose={() => setHistoryVisible(false)}
                onOpen={() => setHistoryVisible(true)}
                open={historyVisible}
                showCloseIcon={false}
            >
                <Header content="History" inverted={inverted} />
            </Modal>
        )
    }

    const leaderBoardModal = () => {
        return (
            <Modal
                classNames={{
                    overlay: modalOverlayClass,
                    modal: modalClass
                }}
                center
                onClose={() => setLeaderboardVisible(false)}
                onOpen={() => setLeaderboardVisible(true)}
                open={leaderboardVisible}
                showCloseIcon={false}
            >
                <Header content="LeaderBoard" inverted={inverted} />
            </Modal>
        )
    }

    return (
        <div className={`headerComponent ${!showDates ? "bordered" : ""}`}>
            <Menu className="headerMenu" inverted={inverted} pointing secondary>
                <Container>
                    <div className="brandName">
                        <img
                            alt="Scenes and the City"
                            id="logo"
                            onClick={() => onClickLogo()}
                            src={inverted ? WordsLogoInverted : WordsLogo}
                        />
                        <Icon
                            color={btnColor}
                            inverted={inverted}
                            name="options"
                            onClick={() => setSidebarVisible(true)}
                        />
                    </div>
                    <div className="floatedRight">
                        <Menu.Item>
                            <Dropdown
                                className="inverted"
                                defaultValue={language}
                                icon={null}
                                item
                                onChange={(e, { value }) => {
                                    dispatch(setLanguage({ language: value }))
                                    localStorage.setItem("language", value)
                                }}
                                options={languages}
                                pointing
                                trigger={<Flag name={language === "en" ? "us" : language} />}
                            />
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                dispatch(toggleInverted())
                                localStorage.setItem("inverted", !inverted)
                            }}
                        >
                            <Icon
                                color={btnColor}
                                inverted={inverted}
                                name={inverted ? "sun" : "moon"}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Dropdown
                                fluid
                                icon={null}
                                item
                                onChange={(e, { value }) => {
                                    if (value === "settings") {
                                        setSettingsVisible(true)
                                    }
                                    if (value === "stats") {
                                        setStatsVisible(true)
                                    }
                                    if (value === "history") {
                                        setHistoryVisible(true)
                                    }
                                    if (value === "leaderboard") {
                                        setLeaderboardVisible(true)
                                    }
                                    if (value === "signin") {
                                        toggleLoginModal()
                                        setDropdownVal(translatedOptions[0].value)
                                    }
                                }}
                                options={translatedOptions}
                                pointing
                                trigger={
                                    <Icon color={btnColor} inverted={inverted} name="options" />
                                }
                                value={dropdownVal}
                            />
                        </Menu.Item>
                        <Menu.Item>
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
                as={Menu}
                direction="bottom"
                icon="labeled"
                inverted={inverted}
                onHide={() => setSidebarVisible(false)}
                size="massive"
                style={{ textAlign: "left" }}
                vertical
                visible={sidebarVisible}
            >
                <Menu.Item as="a" onClick={() => {}}>
                    Stats
                </Menu.Item>
                <Menu.Item as="a" onClick={() => {}}>
                    Settings
                </Menu.Item>
                <Menu.Item as="a" onClick={() => {}}>
                    History
                </Menu.Item>
                <Menu.Item as="a" onClick={() => {}}>
                    Leader Board
                </Menu.Item>
                <Menu.Item as="a" onClick={() => {}}>
                    Make a Quiz
                </Menu.Item>
                {isAuth ? (
                    <Menu.Item as="a" onClick={() => {}}>
                        Sign Out
                    </Menu.Item>
                ) : (
                    <Menu.Item as="a" onClick={() => {}}>
                        Sign In/Sign Up
                    </Menu.Item>
                )}
            </Sidebar>

            <UploadModal modalOpen={uploadModalOpen} setModalOpen={setUploadModalOpen} />

            {settingsModal()}
            {statsModal()}
            {historyModal()}
            {leaderBoardModal()}
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
