import { Button, Container, Form, Header, Image, Segment } from "semantic-ui-react"
import { clearChar, setFile, setImg } from "../reducers/admin"
import { useCallback, useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { toast, ToastContainer } from "react-toastify"
import { toastConfig } from "../options/toast"
import { useDropzone } from "react-dropzone"
import classNames from "classnames"
import AuthenticationForm from "../components/Authentication"
import ModalComponent from "../components/Header/modals/modal"
import CharacterSearch from "../components/Search/Character"
import VideoSearch from "../components/Search/Video"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const AdminPage = () => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const inverted = useSelector((state) => state.app.inverted)
    const char = useSelector((state) => state.admin.char)
    const file = useSelector((state) => state.admin.file)
    const img = useSelector((state) => state.admin.img)
    const video = useSelector((state) => state.admin.video)

    const [loginModal, toggleLoginModal] = useState(false)
    const [imgUploadVisible, setImgUploadVisible] = useState(false)
    const [s3Url, setS3Url] = useState(false)
    const [videoType, setVideoType] = useState(1)
    const [videoVal, setVideoVal] = useState("")
    const [videosVisible, setVideosVisible] = useState(false)
    const [charsVisible, setCharsVisible] = useState(false)
    const [charIsSelf, setCharIsSelf] = useState(false)
    const [actorName, setActorName] = useState("")
    const [charName, setCharName] = useState("")
    const [formLoading, setFormLoading] = useState(false)

    const imgEmpty = img.path === null

    useEffect(() => {
        if (!isAuth) {
            toggleLoginModal(true)
        }
    }, [isAuth])

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

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/png": [".png"],
            "image/jpg": [".jpg", ".jpeg"],
            "image/gif": [".gif"]
        },
        maxFiles: 1,
        onDrop
    })

    const submitCharacterPic = async () => {
        setFormLoading(true)
        const formData = new FormData()
        formData.set("file", file)
        formData.set("charId", char.id)

        await fetch(`${apiBaseUrl}chars/pic`, {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("bearer")}`,
                "Content-Type": "multipart/form-data",
                enctype: "multipart/form-data"
            }
        })
            .then((response) => response.json())
            .then((response) => {
                setS3Url(response.s3Url)
                toast.success("Picture has been created!", toastConfig)
            })
            .catch(() => {
                toast.error("Error submitting pic", toastConfig)
            })
        setFormLoading(false)
    }

    const adminPageClass = classNames({
        adminPage: true
    })

    return (
        <div className={adminPageClass}>
            <Container style={{ padding: "1em" }} text>
                <Header content="Create Character Pic" inverted={inverted} />
                <Form as={Segment} inverted={inverted}>
                    <Form.Field>
                        <VideoSearch
                            initialState="admin"
                            onSelectVideo={(v) => {
                                dispatch(clearChar())
                                setCharsVisible(true)
                            }}
                            setVideoType={(visible) => setVideoType(visible)}
                            setVideoVal={(visible) => setVideoVal(visible)}
                            setVideosVisible={(visible) => setVideosVisible(visible)}
                            videoType={videoType}
                            videoVal={videoVal}
                            videosVisible={videosVisible}
                        />
                    </Form.Field>
                    <Form.Field>
                        <CharacterSearch
                            initialState="admin"
                            actorName={actorName}
                            charName={charName}
                            charIsSelf={charIsSelf}
                            charsVisible={charsVisible}
                            onSelectChar={() => setImgUploadVisible(true)}
                            setActorName={(name) => setActorName(name)}
                            setCharName={(name) => setCharName(name)}
                            setCharIsSelf={(isSelf) => setCharIsSelf(isSelf)}
                            setCharsVisible={(visible) => setCharsVisible(visible)}
                            videoId={video.id}
                        />
                    </Form.Field>
                    {imgUploadVisible && (
                        <Form.Field>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <Segment inverted={inverted} placeholder>
                                    {imgEmpty ? (
                                        <>
                                            <Header
                                                content="Upload a pic"
                                                inverted={inverted}
                                                size="large"
                                                textAlign="center"
                                            />
                                            <Button
                                                color="blue"
                                                content="Select a file"
                                                inverted={inverted}
                                            />
                                        </>
                                    ) : (
                                        <Image fluid src={img.src} />
                                    )}
                                </Segment>
                            </div>
                        </Form.Field>
                    )}
                    {s3Url && (
                        <Form.Field>
                            <Header inverted={inverted}>
                                <a href={s3Url} target="_blank">
                                    {s3Url}
                                </a>
                            </Header>
                        </Form.Field>
                    )}
                    <Form.Field>
                        <Button
                            color="blue"
                            content="Submit"
                            disabled={imgEmpty || !video.id || !char.id}
                            fluid
                            inverted={inverted}
                            loading={formLoading}
                            onClick={() => {
                                submitCharacterPic()
                            }}
                        />
                    </Form.Field>
                </Form>
            </Container>

            <ModalComponent callback={() => toggleLoginModal(false)} open={loginModal} title={null}>
                <AuthenticationForm closeModal={() => toggleLoginModal(false)} size="large" />
            </ModalComponent>
            <ToastContainer />
        </div>
    )
}

export default AdminPage
