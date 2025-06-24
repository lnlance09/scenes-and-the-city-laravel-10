import "./index.scss"
import { Button, Divider, Form, Header, Icon, Input, Transition } from "semantic-ui-react"
import { useEffect, useReducer, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    PASSWORD_RECOVERY_SENT,
    SET_FORGOT,
    SET_LOGIN,
    SET_REGISTER,
    SET_VERIFY
} from "./constants"
import { reducer } from "./reducer"
import { initialAuthState } from "./initialState"
import { toastConfig } from "../../options/toast"
import { appendClassName } from "../../utils/general"
import { toast } from "react-toastify"
import axios from "axios"
import PropTypes from "prop-types"
import validator from "validator"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
// toast.configure(toastConfig)

const AuthenticationForm = ({ showLogin = true, size }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const verify = useSelector((state) => state.app.verify)

    const [internalState, dispatchInternal] = useReducer(reducer, initialAuthState)
    const {
        footerLinkText,
        footerText,
        forgot,
        headerText,
        login,
        passwordReset,
        register,
        showFooter
    } = internalState

    useEffect(() => {
        if (!showLogin) {
            dispatchInternal({ type: SET_REGISTER })
        }
        if (verify) {
            dispatchInternal({ type: SET_VERIFY })
        }
    }, [showLogin, verify])

    const [email, setEmail] = useState("")
    const [forgotEmail, setForgotEmail] = useState("")
    const [loadingForgot, setLoadingForgot] = useState(false)
    const [loadingLogin, setLoadingLogin] = useState(false)
    const [loadingRegistration, setLoadingRegistration] = useState(false)
    const [loadingVerify, setLoadingVerify] = useState(false)
    const [password, setPassword] = useState("")
    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [username, setUsername] = useState("")
    const [verificationCode, setVerificationCode] = useState("")

    const submitForgotPassword = () => {
        setLoadingForgot(true)
        axios
            .post(`${apiBaseUrl}users/forgot`, {
                email: forgotEmail
            })
            .then(async () => {
                dispatchInternal({ type: PASSWORD_RECOVERY_SENT })
                setLoadingForgot(false)
            })
            .catch((error) => {
                setLoadingForgot(false)
                toast.error(error.response.data.message)
            })
    }

    const submitLoginForm = () => {
        if (email.length > 0 && password.length > 0) {
            setLoadingLogin(true)
            axios
                .post(`${apiBaseUrl}users/login`, {
                    email,
                    password
                })
                .then(async (response) => {
                    const { data } = response
                    dispatch({
                        type: "SET_USER_DATA",
                        data
                    })
                    localStorage.setItem("auth", true)
                    localStorage.setItem("bearer", data.bearer)
                    localStorage.setItem("user", JSON.stringify(data.user))
                    localStorage.setItem("verify", data.verify)
                    if (!data.verify) {
                        navigate("/")
                        return
                    }
                    dispatchInternal({ type: SET_VERIFY })
                })
                .catch((error) => {
                    let errorMsg = ""
                    const { status } = error.response
                    const { errors } = error.response.data
                    if (status === 401) {
                        errorMsg = error.response.data.message
                    } else {
                        if (typeof errors.password !== "undefined") {
                            errorMsg = errors.password[0]
                        }

                        if (typeof errors.email !== "undefined") {
                            errorMsg = errors.email[0]
                        }
                    }
                    setLoadingLogin(false)
                    toast.error(errorMsg)
                })
        }
    }

    const submitRegistrationForm = () => {
        setLoadingRegistration(true)
        axios
            .post(`${apiBaseUrl}users/create`, {
                email: regEmail,
                password: regPassword,
                username
            })
            .then(async (response) => {
                const { data } = response
                dispatch({
                    type: "SET_USER_DATA",
                    data
                })
                localStorage.setItem("auth", true)
                localStorage.setItem("bearer", data.bearer)
                localStorage.setItem("user", JSON.stringify(data.user))
                localStorage.setItem("verify", data.verify)
                dispatchInternal({ type: SET_VERIFY })
            })
            .catch((error) => {
                let errorMsg = ""
                const { status } = error.response
                const { errors } = error.response.data
                if (status === 401) {
                    errorMsg = error.response.data.message
                } else {
                    if (typeof errors.username !== "undefined") {
                        errorMsg = errors.username[0]
                    }

                    if (typeof errors.name !== "undefined") {
                        errorMsg = errors.name[0]
                    }

                    if (typeof errors.password !== "undefined") {
                        errorMsg = errors.password[0]
                    }

                    if (typeof errors.email !== "undefined") {
                        errorMsg = errors.email[0]
                    }
                }

                setLoadingRegistration(false)
                toast.error(errorMsg)
            })
    }

    const submitVerificationForm = () => {
        if (verificationCode.length === 4) {
            setLoadingVerify(true)
            axios
                .post(
                    `${apiBaseUrl}users/verify`,
                    {
                        code: verificationCode
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("bearer")}`
                        }
                    }
                )
                .then(async (response) => {
                    const { data } = response
                    dispatch({
                        type: "VERIFY_EMAIL"
                    })
                    setLoadingVerify(false)
                    localStorage.setItem("verify", data.verify)
                    navigate("/")
                })
                .catch((error) => {
                    let errorMsg = ""
                    const { status } = error.response
                    const { errors } = error.response.data
                    if (status === 401) {
                        errorMsg = error.response.data.message
                    } else {
                        if (typeof errors.code !== "undefined") {
                            errorMsg = errors.code[0]
                        }
                    }

                    toast.error(errorMsg)
                    setLoadingVerify(false)
                })
        }
    }

    const toggleLogin = () => {
        const type = login ? SET_REGISTER : SET_LOGIN
        dispatchInternal({ type })
        setLoadingLogin(false)
        setLoadingRegistration(false)
    }

    return (
        <div className="authComponent">
            <Header
                as="h1"
                className="huge"
                content={headerText}
                inverted={inverted}
                textAlign="center"
            />
            <div className={appendClassName("authSegment", inverted)}>
                {forgot && (
                    <Form inverted={inverted} onSubmit={submitForgotPassword} size={size}>
                        <Form.Field>
                            <Input
                                inverted={inverted}
                                onChange={(e, { value }) => setForgotEmail(value)}
                                placeholder="Enter your email"
                                value={forgotEmail}
                            />
                        </Form.Field>
                        <Button
                            color="blue"
                            content="Send Instructions"
                            disabled={!validator.isEmail(forgotEmail)}
                            fluid
                            loading={loadingForgot}
                            size={size}
                            type="submit"
                        />
                    </Form>
                )}

                <Transition animation="scale" duration={500} visible={passwordReset}>
                    <Header inverted={inverted} size="large" textAlign="center">
                        <Header.Content>
                            <Icon color="green" inverted={inverted} name="checkmark" /> An email has
                            been sent to you
                        </Header.Content>
                    </Header>
                </Transition>

                <Transition animation="scale" duration={500} visible={verify}>
                    <Form inverted={inverted} onSubmit={submitVerificationForm} size={size}>
                        <Form.Field>
                            <Input
                                inverted={inverted}
                                label="code"
                                maxLength={4}
                                onChange={(e, { value }) => setVerificationCode(value)}
                                placeholder="Verification code"
                                value={verificationCode}
                            />
                        </Form.Field>
                        <Button
                            color="blue"
                            content="Verify"
                            disabled={verificationCode.length !== 4}
                            fluid
                            loading={loadingVerify}
                            size={size}
                            type="submit"
                        />
                    </Form>
                </Transition>

                {login && !verify && (
                    <Form inverted={inverted} size={size}>
                        <Form.Field>
                            <Input
                                inverted={inverted}
                                onChange={(e, { value }) => setEmail(value)}
                                placeholder="Email or username"
                                value={email}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Input
                                inverted={inverted}
                                onChange={(e, { value }) => setPassword(value)}
                                placeholder="Password"
                                type="password"
                                value={password}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Button
                                color="blue"
                                content="Sign in"
                                fluid
                                loading={loadingLogin}
                                onClick={submitLoginForm}
                                size={size}
                                type="submit"
                            />
                        </Form.Field>
                    </Form>
                )}

                {register && !verify && (
                    <>
                        <Form inverted={inverted} size={size}>
                            <Form.Field>
                                <Input
                                    inverted={inverted}
                                    onChange={(e, { value }) => setRegEmail(value)}
                                    placeholder="Email"
                                    value={regEmail}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    inverted={inverted}
                                    onChange={(e, { value }) => setRegPassword(value)}
                                    value={regPassword}
                                    placeholder="Password"
                                    type="password"
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    inverted={inverted}
                                    onChange={(e, { value }) => setUsername(value)}
                                    placeholder="Username"
                                    value={username}
                                />
                            </Form.Field>
                        </Form>
                        <Divider inverted={inverted} />
                        <Button
                            color="blue"
                            content="Create an account"
                            fluid
                            loading={loadingRegistration}
                            onClick={submitRegistrationForm}
                            size={size}
                        />
                    </>
                )}
            </div>

            {showFooter && (
                <Header as="p" className="footerText" inverted={inverted} textAlign="center">
                    {footerText}{" "}
                    <span className="footerLink" onClick={() => toggleLogin()}>
                        {footerLinkText}
                    </span>
                </Header>
            )}

            {login && (
                <Header
                    as="p"
                    className="forgotText"
                    inverted={inverted}
                    onClick={() => dispatchInternal({ type: SET_FORGOT })}
                    size="small"
                    textAlign="center"
                >
                    Forgot password?
                </Header>
            )}

            {forgot && (
                <Header
                    as="p"
                    className="forgotText"
                    inverted={inverted}
                    onClick={() => dispatchInternal({ type: SET_LOGIN })}
                    size="small"
                    textAlign="center"
                >
                    <Icon name="arrow left" /> Back to login
                </Header>
            )}
        </div>
    )
}

AuthenticationForm.propTypes = {
    showLogin: PropTypes.bool,
    size: PropTypes.string
}

export default AuthenticationForm
