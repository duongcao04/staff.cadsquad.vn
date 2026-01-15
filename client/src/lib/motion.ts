import { HTMLMotionProps, motion, MotionConfig } from 'motion/react'

/**
 * Block
 */
export const MotionDiv = motion.div
export const MotionSection = motion.section
export const MotionAside = motion.aside
export const MotionButton = motion.button
/**
 * List
 */
export const MotionUl = motion.ul
export const MotionLi = motion.li
/**
 * Text
 */
export const MotionP = motion.p
export const MotionSpan = motion.span
export const MotionH1 = motion.h1
export const MotionH2 = motion.h2
export const MotionH3 = motion.h3
export const MotionH4 = motion.h4

export const smoothMotion = {
    variants: {
        enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.4,
                type: 'spring',
                bounce: 0,
                damping: 25,
                stiffness: 300,
            },
        },
        exit: {
            y: 20,
            opacity: 0,
            scale: 0.95,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
    },
}

export { MotionConfig }
