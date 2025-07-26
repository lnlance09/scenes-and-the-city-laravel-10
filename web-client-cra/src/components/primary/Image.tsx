import { Image } from "semantic-ui-react"

type ImageSize = "small" | "medium" | "large"
type Params = {
    alt?: string
    callback?: () => any
    centered?: boolean
    circular?: boolean
    fluid?: boolean
    inverted: boolean
    rounded?: boolean
    src?: string | null
    size?: ImageSize
    style?: any
}

const ImageComponent = ({
    alt = "Scenes and the City",
    callback,
    centered = false,
    circular = false,
    fluid = false,
    inverted,
    rounded = true,
    src,
    size,
    style = {}
}: Params) => {
    const notFoundImg = inverted ? "not-found-inverted" : "not-found"
    const imgSrc = src ? src : `images/${notFoundImg}.png`

    return (
        <Image
            alt={alt}
            centered={centered}
            circular={circular}
            fluid={fluid}
            onClick={() => {
                if (callback === undefined) {
                    return
                }
                callback()
            }}
            onError={(e: any) => (e.target.src = `images/${notFoundImg}.png`)}
            rounded={rounded}
            size={size}
            src={imgSrc}
            style={style}
        />
    )
}

export default ImageComponent
