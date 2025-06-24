import "./index.scss"
import { Button, Container, Dropdown, Flag, Grid, Icon, Menu, Segment } from "semantic-ui-react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { setLanguage, toggleInverted } from "../../reducers/app"
import { languages } from "../../options/languages"
import { options } from "../../options/options"
import { dateFormat, nyc } from "../../utils/date"
import moment from "moment-timezone"
import PropTypes from "prop-types"
import UploadModal from "../UploadModal/"
import WordsLogo from "../../images/logo.svg"
import WordsLogoInverted from "../../images/logo-inverted.svg"
import * as translations from "../../assets/translate.json"

const HeaderComponent = ({ date, onClickDate = () => {}, showDates = true, startOfWeek }) => {
    const dispatch = useDispatch()
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]
    const translatedOptions = options(language)

    const days = lang.days
    const lastIndex = days.length - 1
    const weekend = days[lastIndex]
    const sat = moment(startOfWeek, dateFormat).add(5, "days")
    const sun = moment(startOfWeek, dateFormat).add(6, "days")
    const btnColor = inverted ? "green" : "yellow"
    // console.log("date", date)
    // console.log("start of week", startOfWeek)
    // console.log("date format", dateFormat)

    const [modalOpen, setModalOpen] = useState(false)

    return (
        <div className={`headerComponent ${!showDates ? "bordered" : ""}`}>
            <Menu className="headerMenu" inverted={inverted} pointing secondary>
                <Container>
                    <div className="brandName">
                        <img
                            alt="Scenes and the City"
                            id="logo"
                            src={inverted ? WordsLogoInverted : WordsLogo}
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
                            const weekdate = moment(startOfWeek).tz(nyc).add(i, "days")
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
            <UploadModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
        </div>
    )
}

HeaderComponent.propTypes = {
    date: PropTypes.string,
    onClickDate: PropTypes.func,
    showDates: PropTypes.bool,
    startOfWeek: PropTypes.string
}

export default HeaderComponent
