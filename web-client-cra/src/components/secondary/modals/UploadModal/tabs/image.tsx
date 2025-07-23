import { Button, Divider, Header, Segment } from "semantic-ui-react"
import { setFile, setImg } from "@reducers/form"
import { useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { ReduxState } from "@interfaces/index"
import { FileWithPath, useDropzone } from "react-dropzone"
import classNames from "classnames"
import translations from "@assets/translate.json"

type Props = {
    callback: () => any
}

const ImageUpload = ({ callback }: Props) => {
    const dispatch = useDispatch()

    const img = useSelector((state: ReduxState) => state.form.img)
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    let placeholderStyle = {}
    const imgEmpty = img.path === null
    if (!imgEmpty) {
        placeholderStyle = {
            backgroundImage: `url(${img.src})`,
            height: `${img.dimensions.height / 1.5}px`
        }
    }

    const onDrop = useCallback((files: FileWithPath[]) => {
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
            img.src = typeof reader.result === "string" ? reader.result : ""
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                content={lang.stepOne.header}
                                inverted
                                size="large"
                                textAlign="center"
                            />
                            <Button
                                color={inverted ? "green" : "black"}
                                content={lang.stepOne.addPicture}
                                inverted={inverted}
                            />
                        </>
                    )}
                </Segment>
            </div>
            {!imgEmpty ? (
                <>
                    <Divider inverted={inverted} section />
                    <Button
                        color={inverted ? "green" : "blue"}
                        content={lang.stepOne.submitBtn}
                        fluid
                        inverted={inverted}
                        onClick={() => callback()}
                        size="big"
                    />
                    <div className={uploadClass}>
                        <span onClick={() => open()}>{lang.stepOne.selectAnother}</span>
                    </div>
                </>
            ) : (
                <div className={monroeClass}>
                    <span>{lang.stepOne.placeholderInfo}</span>
                    <span>{lang.stepOne.placeholderCredit}:</span>
                </div>
            )}
        </>
    )
}

export default ImageUpload
