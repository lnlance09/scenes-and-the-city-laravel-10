/* eslint-disable jsx-a11y/anchor-is-valid */
import { GeoData, ReduxState } from "@interfaces/index"
import { Header, List, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { capitalize } from "@utils/general"
import translations from "@assets/translate.json"

type HeaderSize = "medium" | "large"

type Props = {
    answer: GeoData
    headerSize?: HeaderSize
}

const LocationInfo = ({ answer, headerSize = "medium" }: Props) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    const btnColor = inverted ? "green" : "blue"

    return (
        <Segment className="locationInfoSegment" inverted={inverted}>
            {answer.hood !== null && (
                <Header inverted={inverted} size={headerSize}>
                    <Header.Content>
                        {answer.streets.map((s) => (
                            <>
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                    {s}
                                </a>{" "}
                            </>
                        ))}
                    </Header.Content>
                    <Header.Subheader>
                        <i>{lang.main.estimatedLocation}</i>
                    </Header.Subheader>
                </Header>
            )}
            <List inverted={inverted}>
                <List.Item>
                    <List.Icon color={btnColor} inverted={inverted} name="map marker" />
                    <List.Content>
                        {answer.lat}, {answer.lng}
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon color={btnColor} inverted={inverted} name="building" />
                    <List.Content>{`${answer.hood}, ${capitalize(answer.borough)}`}</List.Content>
                </List.Item>
                <List.Item>
                    <List.Icon color={btnColor} inverted={inverted} name="google" />
                    <List.Content>
                        <a
                            className="streetViewLink"
                            onClick={(e) => {
                                const { lat, lng } = answer
                                e.preventDefault()
                                window.open(
                                    `http://maps.google.com/maps?q=&layer=c&cbll=${lat},${lng}`,
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

export default LocationInfo
