import "leaflet/dist/leaflet.css"
import { Marker, TileLayer } from "react-leaflet"
import { useMapEvents } from "react-leaflet/hooks"
import { useMemo, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { MapContainer } from "react-leaflet"
import { mapTheme, invertedMapTheme } from "../../options/maps"
import { toast } from "react-toastify"
import { toastConfig } from "../../options/toast"
import axios from "axios"
import classNames from "classnames"
import PropTypes from "prop-types"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const DraggableMarker = ({ callback = () => null, draggable = true, lat, lng }) => {
    const markerRef = useRef(null)
    const [position, setPosition] = useState({
        lat,
        lng
    })

    const getAreaName = (lat, lng) => {
        axios({
            url: `${apiBaseUrl}location?lat=${lat}&lng=${lng}`
        })
            .then((response) => {
                const { data } = response.data
                callback({
                    lat,
                    lng,
                    hood: data.hood,
                    borough: data.borough,
                    streets: data.streets
                })
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
    }

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker === null) {
                    return
                }

                const position = marker.getLatLng()
                const { lat, lng } = position
                setPosition({
                    lat,
                    lng
                })
                getAreaName(lat, lng)
            }
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <Marker
            className="mapMarker"
            draggable={draggable}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    )
}

DraggableMarker.propTypes = {
    callback: PropTypes.func,
    draggable: PropTypes.bool,
    lat: PropTypes.number,
    lng: PropTypes.number
}

const MapLayers = ({ callback = () => null, draggable = true, lat, lng, url }) => {
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
            <DraggableMarker callback={callback} draggable={draggable} lat={lat} lng={lng} />
            <TileLayer url={url} />
        </>
    )
}

MapLayers.propTypes = {
    callback: PropTypes.func,
    draggable: PropTypes.bool,
    lat: PropTypes.number,
    lng: PropTypes.number,
    url: PropTypes.string
}

const MapComponent = ({ callback = () => null, draggable = true, lat, lng, style }) => {
    const inverted = useSelector((state) => state.app.inverted)
    // eslint-disable-next-line no-unused-vars
    const [zoomLevel, setZoomLevel] = useState(13)

    const mapClassName = classNames({
        mapWrapper: true,
        inverted
    })

    return (
        <div className={mapClassName} style={style}>
            <MapContainer
                center={[lat, lng]}
                style={{ height: "375px", width: "100%" }}
                zoom={zoomLevel}
            >
                <MapLayers
                    callback={callback}
                    draggable={draggable}
                    lat={lat}
                    lng={lng}
                    url={inverted ? invertedMapTheme : mapTheme}
                />
            </MapContainer>
        </div>
    )
}

MapComponent.propTypes = {
    callback: PropTypes.func,
    draggable: PropTypes.bool,
    lat: PropTypes.number,
    lng: PropTypes.number,
    style: PropTypes.object
}

export default MapComponent
