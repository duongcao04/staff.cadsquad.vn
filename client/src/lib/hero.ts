import { heroui } from '@heroui/react'

export default heroui({
    layout: {
        disabledOpacity: '0.7', // opacity-[0.3]
        radius: {
            small: '6px', // rounded-small
            medium: '6px', // rounded-medium
            large: '8px', // rounded-large
        },
        borderWidth: {
            small: '1px', // border-small
            medium: '1px', // border-medium
            large: '1px', // border-large
        },
    },
    themes: {
        light: {},
        dark: {},
    },
})
