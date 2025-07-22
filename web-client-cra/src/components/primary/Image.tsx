import { Image } from "semantic-ui-react"
import NotFoundSvg from "@images/not-found.svg"
import NotFoundSvgInverted from "@images/not-found-inverted.svg"

type ImageSize = "small" | "medium" | "large"
type Params = {
    alt?: string
    callback?: () => any
    centered?: boolean
    circular?: boolean
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
    inverted,
    rounded = true,
    src,
    size,
    style = {}
}: Params) => {
    const notFoundImg = inverted ? NotFoundSvgInverted : NotFoundSvg

    return (
        <Image
            alt={alt}
            centered={centered}
            circular={circular}
            onClick={() => {
                if (callback === undefined) {
                    return
                }
                callback()
            }}
            onError={(e: any) => (e.target.src = notFoundImg)}
            rounded={rounded}
            size={size}
            src={src === undefined || src === null ? notFoundImg : src}
            style={style}
        />
    )
}

export default ImageComponent
