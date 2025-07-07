import "./index.scss"
import { Button, Header, Segment } from "semantic-ui-react"
import { setFile, setImg } from "../../reducers/form"
import { useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useDropzone } from "react-dropzone"
import classNames from "classnames"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const ImageUpload = ({ callback = () => null }) => {
    const dispatch = useDispatch()

    const img = useSelector((state) => state.form.img)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const imgEmpty = img.path === null

    let placeholderStyle = {}
    if (!imgEmpty) {
        placeholderStyle = {
            backgroundImage: `url(${img.src})`,
            height: `${img.height / 1.5}px`
        }
    }

    const onDrop = useCallback((files) => {
        if (files.length !== 1) {
            return
        }

        const file = files[0]
        dispatch(setFile({ file }))

        const reader = new FileReader()
        reader.onabort = () => console.error("file reading was aborted")
        reader.onerror = () => console.error("file reading has failed")
        reader.onload = () => {
            const img = document.createElement("img")
            img.src = reader.result
            img.onload = () => {
                const data = {
                    dimensions: {
                        height: img.height,
                        width: img.width
                    },
                    path: file.path,
                    src: img.src
                }
                dispatch(setImg({ data }))
            }
        }
        reader.readAsDataURL(file)
    }, [])

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: {
            "image/png": [".png"],
            "image/jpg": [".jpg", ".jpeg"],
            "image/gif": [".gif"]
        },
        maxFiles: 1,
        onDrop
    })

    const monroeClass = classNames({
        monroeText: true,
        inverted
    })

    const uploadClass = classNames({
        uploadAgain: true,
        inverted
    })

    return (
        <>
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Segment inverted={inverted} placeholder style={placeholderStyle}>
                    {imgEmpty && (
                        <>
                            <Header
                                content={lang.form.steps[0].header}
                                inverted
                                size="large"
                                textAlign="center"
                            />
                            <Button
                                color={inverted ? "green" : "blue"}
                                content={lang.form.steps[0].addPicture}
                                inverted={inverted}
                            />
                        </>
                    )}
                </Segment>
            </div>
            {!imgEmpty ? (
                <>
                    <div className={uploadClass}>
                        <span onClick={() => open()}>{lang.form.steps[0].selectAnother}</span>
                    </div>
                    <Button
                        color={inverted ? "green" : "blue"}
                        content={lang.form.steps[0].submitBtn}
                        fluid
                        inverted={inverted}
                        onClick={() => callback()}
                        size="large"
                    />
                </>
            ) : (
                <div className={monroeClass}>
                    <span>Marilyn Monroe at Lexington Avenue and 52nd Street circa 1955</span>
                    <span>Credit: </span>
                </div>
            )}
        </>
    )
}

ImageUpload.propTypes = {
    callback: PropTypes.func
}

export default ImageUpload
