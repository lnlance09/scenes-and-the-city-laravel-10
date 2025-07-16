import "./index.scss"
import { Header, Icon, List, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { capitalize } from "../../utils/general"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const LocationInfo = ({ answer, size = "medium" }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    return (
        <Segment className="locationInfoSegment" inverted={inverted}>
            {answer.hood !== null && (
                <Header inverted={inverted} size={size}>
                    <Header.Content>
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            {answer.streets[0]}
                        </a>{" "}
                        {lang.main.inBetween}{" "}
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            {answer.streets[1]}
                        </a>{" "}
                        {lang.main.and}{" "}
                        <a href="#" onClick={(e) => e.preventDefault()}>
                            {answer.streets[2]}
                        </a>
                    </Header.Content>
                    <Header.Subheader>
                        <i>{lang.main.estimatedLocation}</i>
                    </Header.Subheader>
                </Header>
            )}
            <List inverted={inverted}>
                <List.Item>
                    <List.Icon
                        color={inverted ? "green" : "blue"}
                        inverted={inverted}
                        name="map marker"
                    />
                    <List.Content>
                        {answer.lat}, {answer.lng}
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon
                        color={inverted ? "green" : "blue"}
                        inverted={inverted}
                        name="building"
                    />
                    <List.Content>{`${answer.hood}, ${capitalize(answer.borough)}`}</List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon
                        color={inverted ? "green" : "blue"}
                        inverted={inverted}
                        name="google"
                    />
                    <List.Content>
                        <a
                            className="streetViewLink"
                            href="#"
                            onClick={(e) => {
                                e.preventDefault()
                                window.open(
                                    `http://maps.google.com/maps?q=&layer=c&cbll=${answer.lat},${answer.lng}`,
                                    "_blank"
                                )
                            }}
                        >
                            {lang.main.seeStreetView}
                        </a>
                    </List.Content>
                </List.Item>
            </List>
        </Segment>
    )
}

LocationInfo.propTypes = {
    answer: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
        hood: PropTypes.string,
        borough: PropTypes.string,
        streets: PropTypes.arrayOf(PropTypes.string)
    }),
    size: PropTypes.string
}

export default LocationInfo
