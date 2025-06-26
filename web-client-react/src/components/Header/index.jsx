import "./index.scss"
import {
    Button,
    Container,
    Dropdown,
    Flag,
    Grid,
    Icon,
    Menu,
    Segment,
    Sidebar
} from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setLanguage, toggleInverted } from "../../reducers/app"
import { languages } from "../../options/languages"
import { options } from "../../options/options"
import { dateFormat, isSunday, nyc } from "../../utils/date"
import moment from "moment-timezone"
import PropTypes from "prop-types"
import UploadModal from "../UploadModal/"
import WordsLogo from "../../images/logo.svg"
import WordsLogoInverted from "../../images/logo-inverted.svg"
import * as translations from "../../assets/translate.json"

const HeaderComponent = ({ date, onClickDate = () => {}, showDates = true }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const translatedOptions = options(language)

    const [modalOpen, setModalOpen] = useState(false)
    const [sidebarVisible, setSidebarVisible] = useState(false)

    const days = lang.days
    const lastIndex = days.length - 1
    const weekend = days[lastIndex]

    const m = moment(date).tz(nyc)
    const startWeek = (isSunday(date) ? m.subtract(1, "days") : m).startOf("week").add(1, "days")
    const sat = moment(startWeek, dateFormat).add(5, "days")
    const sun = moment(startWeek, dateFormat).add(6, "days")

    const btnColor = inverted ? "green" : "black"

    return (
        <div className={`headerComponent ${!showDates ? "bordered" : ""}`}>
            <Menu className="headerMenu" inverted={inverted} pointing secondary>
                <Container>
                    <div className="brandName">
                        <img
                            alt="Scenes and the City"
                            id="logo"
                            onClick={() => navigate("/")}
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
                                defaultValue={translatedOptions[0].value}
                                fluid
                                icon={null}
                                item
                                options={translatedOptions}
                                pointing
                                trigger={
                                    <Icon color={btnColor} inverted={inverted} name="options" />
                                }
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Button
                                color={btnColor}
                                content={lang.header.makeAQuiz}
                                fluid
                                inverted={inverted}
                                onClick={() => setModalOpen(true)}
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
                <Menu.Item as="a" onClick={() => {}}>
                    Sign In/Sign Up
                </Menu.Item>
            </Sidebar>
            <UploadModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </div>
    )
}

HeaderComponent.propTypes = {
    date: PropTypes.string,
    onClickDate: PropTypes.func,
    showDates: PropTypes.bool
}

export default HeaderComponent
