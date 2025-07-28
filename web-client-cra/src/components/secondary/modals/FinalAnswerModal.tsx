import { Button, Divider, Header, Segment } from "semantic-ui-react"
import { useSelector } from "react-redux"
import { ReduxState } from "@interfaces/index"
import giphy from "@images/regis-philbin.gif"
import ModalComponent from "@components/primary/Modal"
import Typewriter from "typewriter-effect"
import translations from "@assets/translate.json"

type Props = {
    callback: () => any
    formDisabled: boolean
    setFormDisabled: (disabled: boolean) => any
    setVisible: (visible: boolean) => any
    visible: boolean
}

const FinalAnswerModal = ({
    callback,
    formDisabled,
    setFormDisabled,
    setVisible,
    visible
}: Props) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)
    const language = useSelector((state: ReduxState) => state.app.language)
    const lang = translations[language]

    return (
        <div className="finalAnswerModalComponent">
            <ModalComponent
                className={{ finalAnswerModal: true }}
                callback={() => {
                    setVisible(false)
                    setFormDisabled(true)
                }}
                open={visible}
                size="small"
            >
                <Segment basic={!inverted} inverted={inverted}>
                    <img
                        alt="Is that your final answer?"
                        className="ui image fluid rounded bordered centered"
                        src={giphy}
                    />
                    <Header id="typeMessage" size="large" textAlign="center">
                        <Typewriter
                            onInit={(typewriter) => {
                                typewriter
                                    .typeString(lang.main.finalAnswerHeader)
                                    .start()
                                    .callFunction(() => setFormDisabled(false))
                            }}
                            options={{ delay: 75 }}
                        />
                    </Header>
                    <Divider hidden />
                    <Button.Group fluid size="large" widths="eight">
                        <Button
                            color={inverted ? "red" : "black"}
                            content={lang.main.finalAnswerDeny}
                            inverted={inverted}
                            disabled={formDisabled}
                            onClick={() => setVisible(false)}
                        />
                        <Button
                            color={inverted ? "green" : "blue"}
                            content={lang.main.finalAnswerConfirm}
                            inverted={inverted}
                            disabled={formDisabled}
                            onClick={() => callback()}
                        />
                    </Button.Group>
                </Segment>
            </ModalComponent>
        </div>
    )
}

export default FinalAnswerModal
