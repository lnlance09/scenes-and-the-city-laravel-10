import { Button, Form, Input } from "semantic-ui-react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import PropTypes from "prop-types"
import * as translations from "../../assets/translate.json"

const AuthenticationForm = () => {
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)

    const [register, setRegister] = useState(false)

    const signIn = () => {}

    const signUp = () => {}

    return (
        <>
            <Form inverted={inverted} size="large">
                {register ? (
                    <>
                        <Form.Field>
                            <Input placeholder="Username" type="text" />
                        </Form.Field>
                        <Form.Field>
                            <Input placeholder="Email" type="text" />
                        </Form.Field>
                        <Form.Field>
                            <Input placeholder="Password" type="password" />
                        </Form.Field>
                        <Form.Field>
                            <Button
                                color={inverted ? "green" : "blue"}
                                fluid
                                content="Sign Up"
                                onClick={() => {}}
                            />
                        </Form.Field>
                    </>
                ) : (
                    <>
                        <Form.Field>
                            <Input placeholder="Email" type="text" />
                        </Form.Field>
                        <Form.Field>
                            <Input placeholder="Password" type="password" />
                        </Form.Field>
                        <Form.Field>
                            <Button
                                color={inverted ? "green" : "blue"}
                                fluid
                                content="Sign In"
                                onClick={() => {}}
                                size="large"
                            />
                        </Form.Field>
                    </>
                )}
            </Form>
        </>
    )
}

AuthenticationForm.propTypes = {
    register: PropTypes.bool
}

export default AuthenticationForm
