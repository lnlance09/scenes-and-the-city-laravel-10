import "./index.scss"
import { Button, Divider, Form, Header, Icon, Input, Segment, Transition } from "semantic-ui-react"
import {
    setUserData,
    setNeedToVerify,
    verifyEmail,
    setBearer,
    setHardMode,
    setDarkMode,
    setLanguage,
    setReveal,
    setUnits
} from "../../reducers/app"
import { useEffect, useReducer, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
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
import { toast } from "react-toastify"
import axios from "axios"
import classNames from "classnames"
import PropTypes from "prop-types"
import validator from "validator"
import * as translations from "../../assets/translate.json"

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const AuthenticationForm = ({ closeModal = () => null, showLogin = true, size }) => {
    const dispatch = useDispatch()
    const verify = useSelector((state) => state.app.verify)
    const inverted = useSelector((state) => state.app.inverted)
    const language = useSelector((state) => state.app.language)
    const lang = translations[language]

    const [internalState, dispatchInternal] = useReducer(reducer, initialAuthState)
    const { forgot, headerText, login, passwordReset, register } = internalState

    useEffect(() => {
        if (!showLogin) {
            dispatchInternal({ type: SET_REGISTER })
        }
        if (verify) {
            dispatchInternal({ type: SET_VERIFY })
        }
    }, [showLogin, verify])

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loadingLogin, setLoadingLogin] = useState(false)

    const [forgotEmail, setForgotEmail] = useState("")
    const [loadingForgot, setLoadingForgot] = useState(false)

    const [verificationCode, setVerificationCode] = useState("")
    const [loadingVerify, setLoadingVerify] = useState(false)

    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [regUsername, setRegUsername] = useState("")
    const [loadingRegistration, setLoadingRegistration] = useState(false)

    const loginDisabled = email.length < 4 || password.length < 8

    const submitLoginForm = () => {
        if (loginDisabled) {
            return
        }

        setLoadingLogin(true)

        const payload = { password }
        if (validator.isEmail(email)) {
            payload.email = email
        } else {
            payload.username = email
        }

        axios
            .post(`${apiBaseUrl}users/login`, payload)
            .then(async (response) => {
                const { data } = response
                dispatch(setUserData({ user: data.user }))

                const { bearer, settings, verified } = data.user
                localStorage.setItem("auth", 1)
                localStorage.setItem("bearer", bearer)
                localStorage.setItem("hardMode", settings.hardMode)
                localStorage.setItem("inverted", settings.darkMode)
                localStorage.setItem("lang", settings.lang)
                localStorage.setItem("reveal", settings.revealAnswers)
                localStorage.setItem("units", settings.measureUnits)
                localStorage.setItem("user", JSON.stringify(data.user))
                localStorage.setItem("verify", verified ? 1 : 0)

                dispatch(setBearer({ bearer }))
                dispatch(setHardMode({ hardMode: settings.hardMode === 1 }))
                dispatch(setDarkMode({ darkMode: settings.darkMode === 1 }))
                dispatch(setLanguage({ language: settings.lang }))
                dispatch(setReveal({ reveal: settings.revealAnswers === 1 }))
                dispatch(setUnits({ units: settings.measureUnits }))

                if (!verified) {
                    closeModal()
                    toast.success("You have been logged in!", {
                        ...toastConfig,
                        className: inverted ? "inverted" : null
                    })
                    // window.location.reload()
                    return
                }
                dispatch(setNeedToVerify())
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
                toast.error(errorMsg, toastConfig)
            })
    }

    const submitRegistrationForm = () => {
        setLoadingRegistration(true)
        axios
            .post(`${apiBaseUrl}users/register`, {
                email: regEmail,
                password: regPassword,
                username: regUsername
            })
            .then(async (response) => {
                const { data } = response
                dispatch(setUserData({ user: data.user }))
                dispatch(setNeedToVerify())
                dispatchInternal({ type: SET_VERIFY })

                const { bearer, settings } = data.user
                localStorage.setItem("auth", 1)
                localStorage.setItem("bearer", bearer)
                localStorage.setItem("hardMode", settings.hardMode)
                localStorage.setItem("inverted", settings.darkMode)
                localStorage.setItem("lang", settings.lang)
                localStorage.setItem("reveal", settings.revealAnswers)
                localStorage.setItem("units", settings.measureUnits)
                localStorage.setItem("user", JSON.stringify(data.user))
                localStorage.setItem("verify", 1)
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
                toast.error(errorMsg, toastConfig)
            })
    }

    const submitForgotPassword = async () => {
        setLoadingForgot(true)
        const payload = {}
        if (validator.isEmail(forgotEmail)) {
            payload.email = forgotEmail
        } else {
            payload.username = forgotEmail
        }

        await axios
            .post(`${apiBaseUrl}users/forgot`, payload)
            .then(() => {
                dispatchInternal({ type: PASSWORD_RECOVERY_SENT })
            })
            .catch((error) => {
                toast.error(error.response.data.message, toastConfig)
            })
        setLoadingForgot(false)
    }

    const submitVerificationForm = () => {
        if (verificationCode.length !== 4) {
            return
        }

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
            .then(() => {
                dispatch(verifyEmail())
                localStorage.setItem("verify", false)
                setLoadingVerify(false)
                toast.success("Your account has been verified", toastConfig)
                closeModal()
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
                toast.error(errorMsg, toastConfig)
                setLoadingVerify(false)
            })
    }

    const toggleLogin = () => {
        const type = login ? SET_REGISTER : SET_LOGIN
        dispatchInternal({ type })
        setLoadingLogin(false)
        setLoadingRegistration(false)
    }

    const authFooter = (text, linkText) => (
        <Header as="p" className="footerText" inverted={inverted} textAlign="center">
            {text}{" "}
            <span className="footerLink" onClick={() => toggleLogin()}>
                {linkText}
            </span>
        </Header>
    )

    const authSegmentClass = classNames({
        authSegment: true,
        inverted
    })

    return (
        <div className="authComponent">
            <Header
                as="h1"
                className="huge"
                content={headerText}
                inverted={inverted}
                textAlign="center"
            />
            <div className={authSegmentClass}>
                {!verify && (
                    <>
                        {login && (
                            <>
                                <Form inverted={inverted} size={size}>
                                    <Form.Field>
                                        <Input
                                            inverted={inverted}
                                            onChange={(e, { value }) => setEmail(value)}
                                            placeholder={lang.auth.emailOrUsername}
                                            value={email}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Input
                                            inverted={inverted}
                                            onChange={(e, { value }) => setPassword(value)}
                                            placeholder={lang.auth.password}
                                            type="password"
                                            value={password}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Button
                                            color={inverted ? "green" : "blue"}
                                            content={lang.auth.signIn}
                                            fluid
                                            inverted={inverted}
                                            loading={loadingLogin}
                                            onClick={submitLoginForm}
                                            size={size}
                                            type="submit"
                                        />
                                    </Form.Field>
                                </Form>
                                {authFooter(lang.auth.newToThis, lang.auth.signUp)}
                                <Header
                                    as="p"
                                    className="forgotText"
                                    inverted={inverted}
                                    onClick={() => dispatchInternal({ type: SET_FORGOT })}
                                    size="small"
                                    textAlign="center"
                                >
                                    {lang.auth.forgotPassword}
                                </Header>
                            </>
                        )}

                        {register && (
                            <>
                                <Form inverted={inverted} size={size}>
                                    <Form.Field>
                                        <Input
                                            inverted={inverted}
                                            onChange={(e, { value }) => setRegEmail(value)}
                                            placeholder={lang.auth.email}
                                            value={regEmail}
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Input
                                            inverted={inverted}
                                            onChange={(e, { value }) => setRegPassword(value)}
                                            placeholder={lang.auth.password}
                                            value={regPassword}
                                            type="password"
                                        />
                                    </Form.Field>
                                    <Form.Field>
                                        <Input
                                            inverted={inverted}
                                            onChange={(e, { value }) => setRegUsername(value)}
                                            placeholder={lang.auth.username}
                                            value={regUsername}
                                        />
                                    </Form.Field>
                                </Form>
                                <Divider inverted={inverted} />
                                <Button
                                    color={inverted ? "green" : "blue"}
                                    content={lang.auth.regsiterBtn}
                                    fluid
                                    inverted={inverted}
                                    loading={loadingRegistration}
                                    onClick={submitRegistrationForm}
                                    size={size}
                                />
                                {authFooter(lang.auth.alreadyAccount, lang.auth.signIn)}
                            </>
                        )}
                    </>
                )}

                {forgot && (
                    <>
                        <Form inverted={inverted} onSubmit={submitForgotPassword} size={size}>
                            <Form.Field>
                                <Input
                                    inverted={inverted}
                                    onChange={(e, { value }) => setForgotEmail(value)}
                                    placeholder={lang.auth.enterYourEmail}
                                    value={forgotEmail}
                                />
                            </Form.Field>
                            <Button
                                color={inverted ? "green" : "blue"}
                                content={lang.auth.sendIntructions}
                                disabled={forgotEmail.length < 5}
                                fluid
                                inverted={inverted}
                                loading={loadingForgot}
                                size={size}
                                type="submit"
                            />
                        </Form>
                        <Header
                            as="p"
                            className="forgotText"
                            inverted={inverted}
                            onClick={() => dispatchInternal({ type: SET_LOGIN })}
                            size="small"
                            textAlign="center"
                        >
                            <Icon name="arrow left" /> {lang.auth.backToLogin}
                        </Header>
                    </>
                )}

                <Transition animation="scale" duration={500} visible={passwordReset}>
                    <Header inverted={inverted} size="large" textAlign="center">
                        <Header.Content>
                            <Icon color="green" inverted={inverted} name="checkmark" />{" "}
                            {lang.auth.emailSentToYou}
                        </Header.Content>
                    </Header>
                </Transition>

                <Transition animation="scale" duration={500} visible={verify}>
                    <Form inverted={inverted} onSubmit={submitVerificationForm} size={size}>
                        <Form.Field>
                            <Input
                                inverted={inverted}
                                maxLength={4}
                                onChange={(e, { value }) => setVerificationCode(value)}
                                placeholder={lang.auth.verificationCode}
                                value={verificationCode}
                            />
                        </Form.Field>
                        <Button
                            color={inverted ? "green" : "blue"}
                            content={lang.auth.verify}
                            disabled={verificationCode.length !== 4}
                            fluid
                            inverted={inverted}
                            loading={loadingVerify}
                            size={size}
                            type="submit"
                        />
                    </Form>
                </Transition>
            </div>
        </div>
    )
}

AuthenticationForm.propTypes = {
    showLogin: PropTypes.bool,
    size: PropTypes.string
}

export default AuthenticationForm
