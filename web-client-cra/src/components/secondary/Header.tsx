import { Button, Container, Dropdown, Flag, Icon, Image, Label, Menu } from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setDarkMode, setLanguage } from "@reducers/app"
import { languages } from "@options/languages"
import { ClassNames, Language, ReduxState, UnitsUpdate } from "@interfaces/index"
import axios from "axios"
import avatarPic from "@images/avatar/small/zoe.jpg"
import avatarPicInverted from "@images/avatar/small/nan.jpg"
import classNames from "classnames"
import DateGrid from "./DateGrid"
import HistoryModal from "./modals/HistoryModal"
import SidebarComponent from "./Sidebar"
import StatsModal from "./modals/StatsModal"
import UploadModal from "./modals/UploadModal"
import WordsLogo from "@images/logos/logo.svg"
import WordsLogoInverted from "@images/logos/logo-inverted.svg"
import WordsLogoEs from "@images/logos/logo-es.svg"
import WordsLogoInvertedEs from "@images/logos/logo-es-inverted.svg"
import translations from "@assets/translate.json"

type Props = {
    date: string
    loginModalOpen: boolean
    onClickDate: (date: string) => any
    onClickLogo: () => any
    toggleLoginModal: (visible: boolean) => any
    showDates?: boolean
}

const HeaderComponent = ({
    date,
    loginModalOpen,
    onClickDate,
    onClickLogo,
    toggleLoginModal,
    showDates = true
}: Props) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state: ReduxState) => state.app.auth)
    const points = useSelector((state: ReduxState) => state.app.user.points)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const [uploadModalOpen, setUploadModalOpen] = useState(false)
    const [sidebarVisible, setSidebarVisible] = useState(false)

    const [statsVisible, setStatsVisible] = useState(false)
    const [historyVisible, setHistoryVisible] = useState(false)
    const [historyItem, setHistoryItem] = useState("answers")

    const [logo, setLogo] = useState("")

    const btnColor = inverted ? "green" : "blue"

    useEffect(() => {
        if (language === "en" || language === "cn") {
            setLogo(inverted ? WordsLogoInverted : WordsLogo)
        }
        if (language === "es") {
            setLogo(inverted ? WordsLogoInvertedEs : WordsLogoEs)
        }
    }, [inverted, language])

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

    const headerClass = classNames({ headerComponent: true })

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
                                    onChange={(e, { value }) => {
                                        if (value === "en" || value === "es" || value === "cn") {
                                            setLanguageCallback(value)
                                        }
                                    }}
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
                                    updateSettings({ darkMode: !inverted ? true : false })
                                }
                                dispatch(setDarkMode({ darkMode: !inverted }))
                                localStorage.setItem("inverted", !inverted ? "1" : "0")
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
                            onClick={() => setSidebarVisible(!sidebarVisible)}
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
                loginModalOpen={loginModalOpen}
                sidebarVisible={sidebarVisible}
                setHistoryItem={(item) => setHistoryItem(item)}
                setHistoryVisible={(visible) => setHistoryVisible(visible)}
                setStatsVisible={(visible) => setStatsVisible(visible)}
                setUploadModalOpen={(open) => setUploadModalOpen(open)}
                setSidebarVisible={(visible) => setSidebarVisible(visible)}
                toggleLoginModal={(visible) => toggleLoginModal(visible)}
            />
            <UploadModal modalOpen={uploadModalOpen} setModalOpen={setUploadModalOpen} />
            <StatsModal callback={(visible) => setStatsVisible(visible)} modalOpen={statsVisible} />
            <HistoryModal
                activeItem={historyItem}
                callback={(visible) => setHistoryVisible(visible)}
                loginModalOpen={loginModalOpen}
                modalOpen={historyVisible}
                toggleLoginModal={(visible) => toggleLoginModal(visible)}
            />
        </div>
    )
}

export default HeaderComponent
