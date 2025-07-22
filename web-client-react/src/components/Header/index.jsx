import "./index.scss"
import { Button, Container, Dropdown, Flag, Icon, Image, Label, Menu } from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setDarkMode, setLanguage } from "../../reducers/app"
import { languages } from "../../options/languages"
import avatarPic from "../../images/avatar/small/zoe.jpg"
import avatarPicInverted from "../../images/avatar/small/nan.jpg"
import DateGrid from "./dateGrid"
import HistoryModal from "./modals/historyModal"
import SidebarComponent from "./sidebar"
import StatsModal from "./modals/statsModal"
import classNames from "classnames"
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
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [sidebarVisible, setSidebarVisible] = useState(true)

    const [statsVisible, setStatsVisible] = useState(false)
    const [historyVisible, setHistoryVisible] = useState(false)
    const [historyItem, setHistoryItem] = useState("answers")

    const [logo, setLogo] = useState("")

    const btnColor = inverted ? "green" : "blue"

    useEffect(() => {
        if (language === "en" || language == "cn") {
            setLogo(inverted ? WordsLogoInverted : WordsLogo)
        }
        if (language === "es") {
            setLogo(inverted ? WordsLogoInvertedEs : WordsLogoEs)
        }
    }, [inverted, language])

    const updateSettings = (payload) => {
        fetch(`${apiBaseUrl}users/settings`, {
            method: "POST",
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
            {showDates && <DateGrid date={date} onClickDate={(date) => onClickDate(date)} />}
            <SidebarComponent
                sidebarVisible={sidebarVisible}
                setHistoryItem={(item) => setHistoryItem(item)}
                setHistoryVisible={(visible) => setHistoryVisible(visible)}
                setStatsVisible={(visible) => setStatsVisible(visible)}
                setUploadModalOpen={(open) => setUploadModalOpen(open)}
                setSidebarVisible={(visible) => setStatsVisible(visible)}
                toggleLoginModal={(open) => toggleLoginModal(open)}
            />
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
