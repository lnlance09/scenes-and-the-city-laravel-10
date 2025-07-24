/* eslint-disable jsx-a11y/anchor-is-valid */
import { GeoData, ReduxState } from "@interfaces/index"
import { Header, List, Segment } from "semantic-ui-react"
import { TranslationBlock } from "@/interfaces/translations"
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
    const lang: TranslationBlock = translations[language]

    const btnColor = inverted ? "green" : "blue"

    const { borough, hood, lat, lng, streets } = answer
    const mainStreet = streets[0]
    const betweenStreet1 = streets[1]
    const betweenStreet2 = streets[2]

    return (
        <Segment className="locationInfoSegment" inverted={inverted}>
            <Header inverted={inverted} size={headerSize}>
                <Header.Content>
                    <a href="#" onClick={(e) => e.preventDefault()}>
                        {mainStreet}
                    </a>
                    {betweenStreet1 && (
                        <>
                            {` ${lang.main.inBetween} `}
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                {betweenStreet1}
                            </a>
                        </>
                    )}
                    {betweenStreet2 && (
                        <>
                            {` ${lang.main.and} `}
                            <a href="#" onClick={(e) => e.preventDefault()}>
                                {betweenStreet2}
                            </a>
                        </>
                    )}
                </Header.Content>
                <Header.Subheader>
                    <i>{lang.main.estimatedLocation}</i>
                </Header.Subheader>
            </Header>
            <List inverted={inverted}>
                <List.Item>
                    <List.Icon color={btnColor} inverted={inverted} name="map marker" />
                    <List.Content>
                        {lat}, {lng}
                    </List.Content>
                </List.Item>
                {hood && borough && (
                    <List.Item>
                        <List.Icon color={btnColor} inverted={inverted} name="building" />
                        <List.Content>{`${hood}, ${capitalize(borough)}`}</List.Content>
                    </List.Item>
                )}
                <List.Item>
                    <List.Icon color={btnColor} inverted={inverted} name="google" />
                    <List.Content>
                        <a
                            className="streetViewLink"
                            onClick={(e) => {
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
