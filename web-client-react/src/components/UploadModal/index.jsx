import "./index.scss"
import {
    Button,
    Divider,
    Dropdown,
    Form,
    Grid,
    Header,
    Icon,
    Image,
    Input,
    Radio,
    Segment,
    Step,
    Table,
    TextArea,
    Transition
} from "semantic-ui-react"
import { Modal } from "react-responsive-modal"
import {
    addAction,
    clearForm,
    setAction,
    clearChar,
    setChar,
    setChars,
    setImg,
    setVideo,
    setVideos
} from "../../reducers/form"
import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useStore, useDispatch } from "react-redux"
import { useDropzone } from "react-dropzone"
import { DebounceInput } from "react-debounce-input"
import { filterTypes } from "../../options/filters"
import { accept } from "../../options/formUpload"
import { isValidDate } from "../../utils/date"
import { toastConfig } from "../../options/toast"
import { toast } from "react-toastify"
import axios from "axios"
import classNames from "classnames"
import confetti from "canvas-confetti"
import MapComponent from "../Map"
import moment from "moment-timezone"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const animation = "fade"
const duration = 600

const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"]
}

const UploadModal = ({ modalOpen = false, setModalOpen = () => null }) => {
    const navigate = useNavigate()
    const store = useStore()
    const state = store.getState()
    const dispatch = useDispatch()
    const { location } = state.form

    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const action = useSelector((state) => state.form.action)
    const actions = useSelector((state) => state.form.actions)
    const img = useSelector((state) => state.form.img)
    const char = useSelector((state) => state.form.char)
    const chars = useSelector((state) => state.form.chars)
    const video = useSelector((state) => state.form.video)
    const videos = useSelector((state) => state.form.videos)

    const [pageNum, setPageNum] = useState(1)
    const [videoType, setVideoType] = useState(1)
    const [videoVal, setVideoVal] = useState("")
    const [videosVisible, setVideosVisible] = useState(false)
    const [charsVisible, setCharsVisible] = useState(false)
    const [actionsVisible, setActionsVisible] = useState(false)
    const [imgFile, setImgFile] = useState("")
    const [charIsSelf, setCharIsSelf] = useState(false)
    const [actorName, setActorName] = useState("")
    const [hintVal, setHintVal] = useState("")
    const [formLoading, setFormLoading] = useState(false)

    const imgEmpty = img.path === null
    const videoEmpty = video.id === null
    const charEmpty = char.id === null
    const actionEmpty = action.id === null
    const answerStepDisabled = imgEmpty || videoEmpty || charEmpty || actionEmpty
    const submitBtnDisabled = pageNum !== 3

    let placeholderStyle = {}
    if (!imgEmpty) {
        placeholderStyle = {
            backgroundImage: `url(${img.src})`,
            height: `${img.height / 1.5}px`
        }
    }

    const showConfetti = () => {
        confetti({
            ...defaults,
            particleCount: 40,
            scalar: 1.2,
            shapes: ["star"]
        })
        confetti({
            ...defaults,
            particleCount: 10,
            scalar: 0.75,
            shapes: ["circle"]
        })
    }

    const getVideos = (q, type = 5) => {
        setVideosVisible(false)
        axios({
            url: `${apiBaseUrl}videos?q=${q}&type=${type}`
        }).then((response) => {
            const { videos } = response.data.data
            dispatch(setVideos({ videos }))
            setVideosVisible(true)
        })
    }

    const getCharacters = (videoId) => {
        axios({
            url: `${apiBaseUrl}chars/${videoId}`
        }).then((response) => {
            const { chars } = response.data.data
            dispatch(setChars({ chars }))
        })
    }

    const submitQuiz = () => {
        setFormLoading(true)
        const formData = new FormData()
        formData.set("file", imgFile)
        formData.set("videoId", video.id)
        formData.set("charId", char.id)
        formData.set("lat", location.lat)
        formData.set("lng", location.lng)
        formData.set("hintOne", hintVal)

        if (action.id !== 0) {
            formData.set("actionId", action.id)
        }

        if (action.value !== null) {
            formData.set("action", action.value)
        }

        axios
            .post(`${apiBaseUrl}quiz/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("bearer")}`,
                    "Content-Type": "multipart/form-data",
                    enctype: "multipart/form-data"
                }
            })
            .then((response) => {
                const quizId = response.data.quiz
                setModalOpen(false)
                dispatch(clearForm())
                setPageNum(1)
                setVideoVal("")
                setVideosVisible(false)
                setCharsVisible(false)
                setActionsVisible(false)
                setFormLoading(false)
                navigate(`/${quizId}`)
            })
            .catch((error) => {
                toast.error(error.response.data.message, {
                    ...toastConfig,
                    className: inverted ? "inverted" : null
                })
                setFormLoading(false)
            })
    }

    const onDrop = useCallback((files) => {
        if (files.length !== 1) {
            return
        }

        const file = files[0]
        setImgFile(file)

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
        accept,
        maxFiles: 1,
        onDrop
    })

    const UploadForm = (
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
                    <div className="uploadAgain">
                        <span onClick={() => open()}>select another photo</span>
                    </div>
                    <Button
                        color={inverted ? "green" : "blue"}
                        content="Next"
                        fluid
                        inverted={inverted}
                        onClick={() => setPageNum(2)}
                        size="large"
                    />
                </>
            ) : (
                <div className="monroeText">
                    <span>Marilyn Monroe at Lexington Avenue and 52nd Street circa 1955</span>
                    <span>Credit: </span>
                </div>
            )}
        </>
    )

    const InfoForm = (
        <Form inverted={inverted} size="large">
            <Form.Field>
                <Header
                    className="videoHeader"
                    content={lang.form.steps[1].headerOne}
                    inverted={inverted}
                />
                <div className={`ui left icon input fluid ${inverted ? "inverted" : ""}`}>
                    <Icon name="film" />
                    <DebounceInput
                        debounceTimeout={500}
                        minLength={1}
                        onChange={(e) => {
                            const val = e.target.value
                            setVideoVal(val)
                            getVideos(val, videoType)
                        }}
                        placeholder={lang.form.steps[1].formOnePlaceholder}
                        value={videoVal}
                    />
                </div>
                <div style={{ margin: "1em 0" }}>
                    {filterTypes.map((filter) => (
                        <Radio
                            checked={videoType === filter.value}
                            key={filter.name}
                            label={filter.name}
                            name="videoType"
                            onChange={(e, { value }) => {
                                setVideoType(value)
                                getVideos(videoVal, value)
                            }}
                            value={filter.value}
                        />
                    ))}
                </div>
                {!videoEmpty && (
                    <>
                        <Header className="videoItemHeader" inverted={inverted} size="small">
                            <Image alt={video.title} rounded src={video.img} />
                            <Header.Content>
                                {video.title}
                                <Header.Subheader>{video.year}</Header.Subheader>
                            </Header.Content>
                        </Header>
                    </>
                )}
                {!videoEmpty && videosVisible && <Divider inverted={inverted} />}
                {/* Video Drop Down */}
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={videosVisible}
                >
                    <div>
                        {videos.length > 0 ? (
                            <Table celled inverted={inverted} selectable striped>
                                <Table.Body>
                                    {videos.map((v) => (
                                        <Table.Row
                                            key={v.id}
                                            onClick={() => {
                                                const video = {
                                                    id: v.id,
                                                    img: v.img,
                                                    title: v.title,
                                                    year: v.year
                                                }
                                                dispatch(setVideo({ video }))
                                                dispatch(clearChar())
                                                getCharacters(v.id)
                                                setVideosVisible(false)
                                                setCharsVisible(true)
                                            }}
                                        >
                                            <Table.Cell>
                                                <Header inverted={inverted} size="small">
                                                    <Image bordered rounded src={v.img} />
                                                    <Header.Content>
                                                        {v.title}
                                                        <Header.Subheader>
                                                            {`${v.year}${isValidDate(v.releaseDate) ? ` • ${moment(v.releaseDate).fromNow()}` : ""}`}
                                                        </Header.Subheader>
                                                    </Header.Content>
                                                </Header>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        ) : (
                            <Segment
                                basic
                                className="noResults"
                                inverted={inverted}
                                textAlign="center"
                            >
                                <Header content={lang.form.steps[1].noResults} size="small" />
                            </Segment>
                        )}
                    </div>
                </Transition>
                {!videoEmpty && chars.length > 0 && (
                    <Divider horizontal inverted={inverted} section>
                        <Icon inverted={inverted} name="question" />
                    </Divider>
                )}
            </Form.Field>
            {/* Characters drop down */}
            <Form.Field>
                {chars.length > 0 && (
                    <Header className="charHeader" inverted={inverted}>
                        <Header.Content>
                            {lang.form.steps[1].headerTwo}
                            <Header.Subheader>
                                {!charEmpty && (
                                    <a href="#" onClick={() => setCharsVisible(true)}>
                                        {lang.form.steps[1].seeFullCast}
                                    </a>
                                )}
                            </Header.Subheader>
                        </Header.Content>
                    </Header>
                )}
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={!charEmpty}
                >
                    <div>
                        <Segment
                            className="activeCharSegment"
                            color={inverted ? "green" : "blue"}
                            inverted={inverted}
                            secondary
                        >
                            <Header inverted={inverted} size="small">
                                <Header.Content>
                                    {char.name}
                                    <Header.Subheader>{char.actor.name}</Header.Subheader>
                                </Header.Content>
                            </Header>
                        </Segment>
                    </div>
                </Transition>
                <Transition
                    animation={animation}
                    duration={duration}
                    unmountOnHide
                    visible={charsVisible && chars.length > 0}
                >
                    <div>
                        <Table celled inverted={inverted} selectable striped>
                            <Table.Body>
                                {chars.map((c) => {
                                    const { actor, firstName, lastName } = c
                                    const charName = `${firstName}${!lastName ? "" : " " + lastName}`
                                    const actorName = `${actor.firstName}${!actor.lastName ? "" : " " + actor.lastName}`
                                    return (
                                        <Table.Row
                                            key={`${charName}-${c.id}`}
                                            onClick={() => {
                                                setCharIsSelf(firstName.toLowerCase() === "self")
                                                setActorName(actorName)
                                                const char = {
                                                    id: c.id,
                                                    name: charName,
                                                    actor: {
                                                        id: actor.id,
                                                        name: actorName
                                                    }
                                                }
                                                dispatch(setChar({ char }))
                                                setCharsVisible(false)
                                                setActionsVisible(true)
                                            }}
                                        >
                                            <Table.Cell>
                                                <Header inverted={inverted} size="small">
                                                    {charIsSelf ? (
                                                        <Header.Content>{actorName}</Header.Content>
                                                    ) : (
                                                        <Header.Content>
                                                            {charName}
                                                            <Header.Subheader>
                                                                {actorName}
                                                            </Header.Subheader>
                                                        </Header.Content>
                                                    )}
                                                </Header>
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                })}
                            </Table.Body>
                        </Table>
                    </div>
                </Transition>
                {!videoEmpty && !charEmpty && actionsVisible && (
                    <Divider horizontal inverted={inverted} section>
                        <Icon inverted={inverted} name="question" />
                    </Divider>
                )}
            </Form.Field>
            <Form.Field>
                {actionsVisible && (
                    <>
                        <Header
                            className="actionHeader"
                            content={`What is ${charIsSelf ? actorName : char.name} doing?`}
                            inverted={inverted}
                        />
                        <Dropdown
                            allowAdditions
                            className={inverted ? "inverted" : ""}
                            defaultUpward
                            fluid
                            maxLength={20} // Need to find out how to limit to 20
                            onAddItem={(e, { value }) => {
                                const action = {
                                    id: 0,
                                    key: value,
                                    name: value,
                                    text: value,
                                    value
                                }
                                dispatch(addAction({ action }))
                                dispatch(setAction({ action }))
                            }}
                            onChange={(e, { value }) => {
                                // NOT on keyup. This gets triggered when an item from the dropdown is clicked
                                const action = actions.find((a) => a.value === value)
                                if (action === undefined) {
                                    return
                                }
                                dispatch(
                                    setAction({
                                        action: {
                                            id: action.id,
                                            key: null,
                                            name: null,
                                            text: null,
                                            value: null
                                        }
                                    })
                                )
                            }}
                            options={actions}
                            placeholder={lang.form.steps[1].formThreePlaceholder}
                            search
                            selection
                            value={action.id === 0 ? action.value : action.id}
                        />
                    </>
                )}
            </Form.Field>
            <Form.Field>
                {!videoEmpty && !charEmpty && (
                    <Button
                        color={inverted ? "green" : "blue"}
                        content="Next"
                        disabled={actionEmpty}
                        fluid
                        inverted={inverted}
                        onClick={() => setPageNum(3)}
                        size="large"
                    />
                )}
            </Form.Field>
        </Form>
    )

    const AnswerForm = (
        <>
            <Grid columns="equal" inverted={inverted} stackable>
                <Grid.Row>
                    <Grid.Column>
                        <Header
                            content="Where is this scene located?"
                            inverted={inverted}
                            size="large"
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <Header
                            content={lang.form.steps[2].hintHeader}
                            inverted={inverted}
                            size="large"
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <MapComponent />
                    </Grid.Column>
                    <Grid.Column>
                        <Form>
                            <TextArea
                                inverted={inverted}
                                onChange={(e, { value }) => setHintVal(value)}
                                placeholder={""}
                            />
                        </Form>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Divider inverted={inverted} />
            {!submitBtnDisabled && (
                <Button
                    color={inverted ? "green" : "blue"}
                    content="Submit"
                    // disabled={}
                    fluid
                    inverted={inverted}
                    loading={formLoading}
                    onClick={() => {
                        submitQuiz()
                    }}
                    size="large"
                />
            )}
        </>
    )

    const modalClass = classNames({
        submitSceneModal: true,
        simpleModal: true,
        inverted
    })
    const modalOverlayClass = classNames({
        submitSceneModalOverlay: true,
        simpleModalOverlay: true,
        inverted
    })

    return (
        <Modal
            classNames={{
                overlay: modalOverlayClass,
                modal: modalClass
            }}
            onClose={() => setModalOpen(false)}
            onOpen={() => setModalOpen(true)}
            open={modalOpen}
            showCloseIcon={false}
        >
            <Step.Group fluid widths="three">
                <Step
                    active={pageNum === 1}
                    className={inverted ? "inverted" : ""}
                    onClick={() => setPageNum(1)}
                >
                    <Icon inverted={inverted} name="picture" />
                    <Step.Content>
                        <Step.Title>{lang.form.steps[0].name}</Step.Title>
                        <Step.Description>{lang.form.steps[0].description}</Step.Description>
                    </Step.Content>
                </Step>
                <Step
                    active={pageNum === 2}
                    className={inverted ? "inverted" : ""}
                    disabled={pageNum === 1 || imgEmpty}
                    onClick={() => setPageNum(2)}
                >
                    <Icon inverted={inverted} name="info" />
                    <Step.Content>
                        <Step.Title>{lang.form.steps[1].name}</Step.Title>
                        <Step.Description>{lang.form.steps[1].description}</Step.Description>
                    </Step.Content>
                </Step>
                <Step
                    active={pageNum === 3}
                    className={inverted ? "inverted" : ""}
                    disabled={pageNum !== 3 || answerStepDisabled}
                    onClick={() => setPageNum(3)}
                >
                    <Icon inverted={inverted} name="world" />
                    <Step.Content>
                        <Step.Title>{lang.form.steps[2].name}</Step.Title>
                        <Step.Description>{lang.form.steps[2].description}</Step.Description>
                    </Step.Content>
                </Step>
            </Step.Group>
            {pageNum === 1 && <>{UploadForm}</>}
            {pageNum === 2 && <>{InfoForm}</>}
            {pageNum === 3 && <>{AnswerForm}</>}
        </Modal>
    )
}

UploadModal.propTypes = {
    modalOpen: PropTypes.bool,
    setModalOpen: PropTypes.func
}

export default UploadModal
