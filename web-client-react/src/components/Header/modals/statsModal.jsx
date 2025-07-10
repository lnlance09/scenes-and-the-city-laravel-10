import "../index.scss"
import { Grid, Header, Segment } from "semantic-ui-react"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import ModalComponent from "./modal"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const StatsModal = ({ callback = () => null, modalOpen = false }) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [totalAnswers, setTotalAnswers] = useState(0)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [accuracy, setAccuracy] = useState("0%")
    const [currentStreak, setCurrentStreak] = useState("2 days")
    const [marginOfError, setMarginOfError] = useState("5.25")

    const getStats = () => {
        axios({
            url: `${apiBaseUrl}users/stats`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`
            }
        }).then((response) => {
            setTotalAnswers(response.data.totalAnswers)
            setCorrectAnswers(response.data.correctAnswers)
            setAccuracy(response.data.accuracy)
            setCurrentStreak(response.data.currentStreak)
            setMarginOfError(response.data.margin)
        })
    }

    useEffect(() => {
        if (isAuth) {
            getStats()
        }
    }, [isAuth])

    return (
        <div className="statsModalComponent">
            <ModalComponent
                callback={() => callback(false)}
                open={modalOpen}
                title={lang.main.stats}
            >
                <Segment inverted={inverted}>
                    <Grid celled="internally" columns="equal" inverted={inverted} stackable>
                        <Grid.Row>
                            <Grid.Column>
                                <Header
                                    className="statNumber"
                                    content={totalAnswers}
                                    inverted={inverted}
                                    size="huge"
                                    textAlign="center"
                                />
                                <Header
                                    content={lang.stats.totalAnswers}
                                    inverted={inverted}
                                    size="medium"
                                    textAlign="center"
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Header
                                    className="statNumber"
                                    content={correctAnswers}
                                    inverted={inverted}
                                    size="huge"
                                    textAlign="center"
                                />
                                <Header
                                    content={lang.stats.correctAnswers}
                                    inverted={inverted}
                                    size="medium"
                                    textAlign="center"
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Header
                                    className="statNumber"
                                    content={accuracy}
                                    inverted={inverted}
                                    size="huge"
                                    textAlign="center"
                                />
                                <Header
                                    content={lang.stats.accuracy}
                                    inverted={inverted}
                                    size="medium"
                                    textAlign="center"
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Header
                                    className="statNumber"
                                    content={currentStreak}
                                    inverted={inverted}
                                    size="huge"
                                    textAlign="center"
                                />
                                <Header
                                    content={lang.stats.currentStreak}
                                    inverted={inverted}
                                    size="medium"
                                    textAlign="center"
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Header
                                    className="statNumber"
                                    content={marginOfError}
                                    inverted={inverted}
                                    size="huge"
                                    textAlign="center"
                                />
                                <Header
                                    content={lang.stats.marginOfError}
                                    inverted={inverted}
                                    size="medium"
                                    textAlign="center"
                                />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </ModalComponent>
        </div>
    )
}

StatsModal.propTypes = {
    callback: PropTypes.func,
    modalOpen: PropTypes.bool
}

export default StatsModal
