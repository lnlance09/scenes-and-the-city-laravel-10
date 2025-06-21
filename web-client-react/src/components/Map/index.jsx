import "leaflet/dist/leaflet.css"
import { Marker, TileLayer } from "react-leaflet"
import { useMapEvents } from "react-leaflet/hooks"
import { useMemo, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { MapContainer } from "react-leaflet"
import { setLocation } from "../../reducers/form"
import { mapTheme, invertedMapTheme } from "../../options/mapThemes"
import { appendClassName } from "../../utils/general"
import PropTypes from "prop-types"

const DraggableMarker = ({ lat, lon }) => {
    const dispatch = useDispatch()

    const markerRef = useRef(null)
    const [position, setPosition] = useState({
        lat,
        lon
    })
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker !== null) {
                    const position = marker.getLatLng()
                    dispatch(
                        setLocation({
                            location: { lat: position.lat, lng: position.lng }
                        })
                    )
                    setPosition(position)
                }
            }
        }),
        []
    )

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    )
}

DraggableMarker.propTypes = {
    lat: PropTypes.number,
    lon: PropTypes.number
}

const MapLayers = ({ lat, lon, url }) => {
    const map = useMapEvents({
        click: () => {
            map.locate()
        },
        locationfound: (location) => {
            console.log("location found:", location)
        }
    })

    return (
        <>
            <DraggableMarker lat={lat} lon={lon} />
            <TileLayer url={url} />
        </>
    )
}

MapLayers.propTypes = {
    lat: PropTypes.number,
    lon: PropTypes.number,
    url: PropTypes.string
}

const MapComponent = ({ style }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const latitude = useSelector((state) => state.form.location.lat)
    const longitude = useSelector((state) => state.form.location.lng)
    const [zoomLevel, setZoomLevel] = useState(14)

    return (
        <div className={appendClassName("mapWrapper", inverted)} style={style}>
            <MapContainer
                center={[latitude, longitude]}
                style={{ height: "400px", width: "100%" }}
                zoom={zoomLevel}
            >
                <MapLayers
                    lat={latitude}
                    lon={longitude}
                    url={inverted ? invertedMapTheme : mapTheme}
                />
            </MapContainer>
        </div>
    )
}

MapComponent.propTypes = {
    style: PropTypes.object
}

export default MapComponent
