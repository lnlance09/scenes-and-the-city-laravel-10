import "leaflet/dist/leaflet.css"
import { Marker, TileLayer } from "react-leaflet"
import { useMapEvents } from "react-leaflet/hooks"
import { useMemo, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { MapContainer } from "react-leaflet"
import { setLocation } from "../../reducers/form"
import { mapTheme, invertedMapTheme } from "../../options/mapThemes"
import { appendClassName } from "../../utils/general"
import axios from "axios"
import PropTypes from "prop-types"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const DraggableMarker = ({ callback = () => null, lat, lon }) => {
    const dispatch = useDispatch()

    const getAreaName = (lat, lng) => {
        axios({
            url: `${apiBaseUrl}location?lat=${lat}&lng=${lng}`
        }).then((response) => {
            console.log("geo data", response.data)
            const { data } = response.data
            callback({
                lat,
                lng,
                hood: data.hood,
                borough: data.borough,
                description: ""
            })
        })
    }

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
                    /*
                    dispatch(
                        setLocation({
                            location: { lat: position.lat, lng: position.lng }
                        })
                    )
                    */
                    setPosition(position)
                    getAreaName(position.lat, position.lng)
                }
            }
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
    callback: PropTypes.func,
    lat: PropTypes.number,
    lon: PropTypes.number
}

const MapLayers = ({ callback = () => null, lat, lon, url }) => {
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
            <DraggableMarker callback={callback} lat={lat} lon={lon} />
            <TileLayer url={url} />
        </>
    )
}

MapLayers.propTypes = {
    callback: PropTypes.func,
    lat: PropTypes.number,
    lon: PropTypes.number,
    url: PropTypes.string
}

const MapComponent = ({ callback = () => null, style }) => {
    const inverted = useSelector((state) => state.app.inverted)
    const latitude = useSelector((state) => state.form.location.lat)
    const longitude = useSelector((state) => state.form.location.lng)
    // eslint-disable-next-line no-unused-vars
    const [zoomLevel, setZoomLevel] = useState(14)

    return (
        <div className={appendClassName("mapWrapper", inverted)} style={style}>
            <MapContainer
                center={[latitude, longitude]}
                style={{ height: "400px", width: "100%" }}
                zoom={zoomLevel}
            >
                <MapLayers
                    callback={callback}
                    lat={latitude}
                    lon={longitude}
                    url={inverted ? invertedMapTheme : mapTheme}
                />
            </MapContainer>
        </div>
    )
}

MapComponent.propTypes = {
    callback: PropTypes.func,
    style: PropTypes.object
}

export default MapComponent
