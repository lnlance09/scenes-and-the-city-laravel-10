import "./index.scss"
import { Header, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { capitalize } from "../../utils/general"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const LocationInfo = ({ answer, size = "medium" }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    return (
        <Segment className="locationInfoSegment" inverted={inverted} raised>
            {answer.hood !== null && (
                <Header inverted={inverted} size={size}>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        {answer.streets[0]}
                    </a>{" "}
                    in between{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        {answer.streets[1]}
                    </a>{" "}
                    and{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        {answer.streets[2]}
                    </a>
                    <Header.Subheader>
                        {`${answer.hood}, ${capitalize(answer.borough)}`} -{" "}
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
                    </Header.Subheader>
                </Header>
            )}
        </Segment>
    )
}

LocationInfo.propTypes = {
    answer: PropTypes.objectOf(
        PropTypes.shape({
            lat: PropTypes.number,
            lng: PropTypes.number,
            hood: PropTypes.string,
            borough: PropTypes.string,
            streets: PropTypes.arrayOf(PropTypes.string)
        })
    ),
    size: PropTypes.string
}

export default LocationInfo
