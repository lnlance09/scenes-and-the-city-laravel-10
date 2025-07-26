import { ReactNode } from "react"
import { ClassNames, Nullable, ReduxState } from "@interfaces/index"
import { Header, Modal } from "semantic-ui-react"
import { useSelector } from "react-redux"
import classNames from "classnames"

type ModalSize = "small" | "large"

type ModalParams = {
    children: ReactNode
    basic?: boolean
    callback: () => any
    className?: ClassNames
    open: boolean
    size?: ModalSize
    title?: Nullable<string>
}

const ModalComponent = ({
    children,
    basic = false,
    callback,
    className,
    open,
    size = "small",
    title = null
}: ModalParams) => {
    const inverted = useSelector((state: ReduxState) => state.app.inverted)

    const modalClass = classNames({
        ...className,
        inverted
    })

    const headerClass = classNames({ modalComponent: true })

    return (
        <div className={headerClass}>
            <Modal
                basic={inverted || basic}
                centered={false}
                className={modalClass}
                onClose={() => callback()}
                open={open}
                closeIcon="close"
                size={size}
            >
                {title && (
                    <Header
                        className="settingsModalHeader"
                        content={title}
                        inverted={inverted}
                        size="large"
                    />
                )}
                <Modal.Content className="modalContent">{children}</Modal.Content>
            </Modal>
        </div>
    )
}

export default ModalComponent
