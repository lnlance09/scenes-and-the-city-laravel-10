import "../index.scss"
import { Form, List, Radio, Segment, Select } from "semantic-ui-react"
import { useSelector, useDispatch } from "react-redux"
import { setHardMode, setReveal, setUnits } from "../../../reducers/app"
import ModalComponent from "./modal"
import PropTypes from "prop-types"
import * as translations from "../../../assets/translate.json"

const SettingsModal = ({
    callback = () => null,
    modalOpen = false,
    updateSettings = () => null
}) => {
    const dispatch = useDispatch()
    const isAuth = useSelector((state) => state.app.auth)
    const hardMode = useSelector((state) => state.app.hardMode)
    const reveal = useSelector((state) => state.app.reveal)
    const units = useSelector((state) => state.app.units)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    console.log("units", units)
    return (
        <div className="settingsModalComponent">
            <ModalComponent
                callback={() => callback(false)}
                open={modalOpen}
                title={lang.main.settings}
            >
                <Segment basic={!inverted} inverted={inverted}>
                    <List inverted={inverted} size="big">
                        <List.Item>
                            <List.Content floated="right">
                                <Radio
                                    checked={hardMode}
                                    onChange={(e, data) => {
                                        updateSettings({ hardMode: data.checked ? 1 : 0 })
                                        dispatch(setHardMode({ hardMode: data.checked }))
                                    }}
                                    toggle
                                />
                            </List.Content>
                            <List.Content>{lang.settings.hardMode}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Content floated="right">
                                <Radio
                                    checked={reveal}
                                    onChange={(e, data) => {
                                        updateSettings({ reveal: data.checked ? 1 : 0 })
                                        dispatch(setReveal({ reveal: data.checked }))
                                    }}
                                    toggle
                                />
                            </List.Content>
                            <List.Content>{lang.settings.revealAnswers}</List.Content>
                        </List.Item>
                        <List.Item>
                            <List.Content floated="right">
                                <Form inverted={inverted} size="small">
                                    <Select
                                        placeholder="Select units"
                                        onChange={(e, { value }) => {
                                            updateSettings({ units: value })
                                            dispatch(setUnits({ units: value }))
                                        }}
                                        options={[
                                            { key: "miles", value: "miles", text: "miles" },
                                            {
                                                key: "kilometers",
                                                value: "kilometers",
                                                text: "kilometers"
                                            }
                                        ]}
                                        value={units}
                                    />
                                </Form>
                            </List.Content>
                            <List.Content>{lang.settings.units}</List.Content>
                        </List.Item>
                    </List>
                </Segment>
            </ModalComponent>
        </div>
    )
}

SettingsModal.propTypes = {
    callback: PropTypes.func,
    modalOpen: PropTypes.bool,
    updateSettings: PropTypes.func
}

export default SettingsModal
