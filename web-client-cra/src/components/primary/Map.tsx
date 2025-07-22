import "leaflet/dist/leaflet.css"
import { Marker, Popup, TileLayer } from "react-leaflet"
import { useMapEvents } from "react-leaflet"
import { Icon } from "leaflet"
import { useMemo, useRef, useState } from "react"
import { GeoData, ReduxState } from "../../interfaces"
import { useSelector } from "react-redux"
import { MapContainer } from "react-leaflet"
import { mapTheme, invertedMapTheme } from "@options/maps"
import { toastConfig } from "@options/toast"
import { toast } from "react-toastify"
import axios from "axios"
import classNames from "classnames"
import empireStateIcon from "@images/pizza-slice.svg"
import empireStateInvertedIcon from "@images/pizza-slice-inverted.svg"
import queryString from "query-string"

const iconData = {
    className: "blinking",
    iconUrl: empireStateIcon
}
const empireIcon = new Icon(iconData)
const empireIconInverted = new Icon({
    ...iconData,
    iconUrl: empireStateInvertedIcon
})

type MarkerProps = {
    callback: (data: GeoData) => any
    draggable: boolean
    lat: number
    lng: number
}

const DraggableMarker = ({ callback = () => null, draggable = true, lat, lng }: MarkerProps) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const markerRef = useRef<any>(null)
    const [position, setPosition] = useState({
        lat,
        lng
    })

    const getLocationInfo = (lat: number, lng: number) => {
        const url = `${process.env.REACT_APP_API_BASE_URL}location`
        const qs = queryString.stringify({ lat, lng })
        axios
            .get(`${url}?${qs}`)
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
            .catch(() => toast.error("Error fetching location", toastConfig))
    }

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                const position = marker?.getLatLng()
                const { lat, lng } = position
                setPosition({ lat, lng })
                getLocationInfo(lat, lng)
            }
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    )

    return (
        <Marker
            draggable={draggable}
            eventHandlers={eventHandlers}
            icon={inverted ? empireIconInverted : empireIcon}
            position={position}
            ref={markerRef}
        >
            <Popup>Text</Popup>
        </Marker>
    )
}

type LayerProps = {
    callback: (data: GeoData) => any
    draggable: boolean
    lat: number
    lng: number
    url: string
}

const MapLayers = ({ callback = () => null, draggable = true, lat, lng, url }: LayerProps) => {
    const map = useMapEvents({
        click: () => {
            map.locate()
        },
        locationfound: (location: any) => {
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

type MapProps = {
    callback: (data: GeoData) => any
    draggable?: boolean
    lat: number
    lng: number
    style?: any
}

const MapComponent = ({ callback = () => null, draggable = true, lat, lng, style }: MapProps) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)

    const mapClassName = classNames({
        mapWrapper: true,
        inverted
    })

    return (
        <div className={mapClassName} style={style}>
            <MapContainer center={[lat, lng]} style={{ height: "375px", width: "100%" }} zoom={13}>
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

export default MapComponent
