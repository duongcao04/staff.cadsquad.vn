import { smoothMotion } from '@/lib/motion'
import {
    Modal,
    ModalBody,
    ModalBodyProps,
    ModalContent,
    ModalContentProps,
    ModalFooter,
    ModalFooterProps,
    ModalHeader,
    ModalHeaderProps,
    ModalProps,
} from '@heroui/react'

export const HeroModal = (props: ModalProps) => {
    const { children, motionProps, ...rest } = props

    return (
        <Modal
            {...rest}
            motionProps={{
                variants:smoothMotion.variants,
                ...props.motionProps,
            }}
            hideCloseButton={props.hideCloseButton || true}
        >
            {children}
        </Modal>
    )
}

export const HeroModalContent = (props: ModalContentProps) => {
    return <ModalContent {...props} />
}

export const HeroModalHeader = (props: ModalHeaderProps) => {
    return <ModalHeader {...props} />
}

export const HeroModalBody = (props: ModalBodyProps) => {
    return <ModalBody {...props} />
}

// Đã sửa type: ModalBodyProps -> ModalFooterProps
export const HeroModalFooter = (props: ModalFooterProps) => {
    return <ModalFooter {...props} />
}
