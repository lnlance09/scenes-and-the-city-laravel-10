import "../index.scss"
import { Header, Modal } from "semantic-ui-react"
import { useSelector } from "react-redux"
import classNames from "classnames"
import PropTypes from "prop-types"

const ModalComponent = ({
    children,
    basic = false,
    callback,
    className,
    open,
    size = "small",
    title = null
}) => {
    const inverted = useSelector((state) => state.app.inverted)

    const modalClass = classNames({
        ...className,
        inverted
    })

    const headerClass = classNames({
        modalComponent: true
    })

    return (
        <div className={headerClass}>
            <Modal
                basic={inverted || basic}
                centered={false}
                className={modalClass}
                onClose={() => {
                    callback()
                }}
                open={open}
                closeIcon={false}
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
                <Modal.Content>{children}</Modal.Content>
            </Modal>
        </div>
    )
}

ModalComponent.propTypes = {
    basic: PropTypes.bool,
    callback: PropTypes.func,
    children: PropTypes.element,
    className: PropTypes.object,
    open: PropTypes.bool,
    size: PropTypes.oneOf(["small", "large"]),
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
}

export default ModalComponent
