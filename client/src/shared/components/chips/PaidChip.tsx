import { Chip, type ChipProps } from '@heroui/react'
import { useTheme } from 'next-themes'

import {
    cn,
    darkenHexColor,
    lightenHexColor,
    PAID_STATUS_COLOR,
} from '@/lib/utils'

type Props = {
    status: 'paid' | 'unpaid'
    classNames?: ChipProps['classNames']
    props?: ChipProps
    childrenRender?: (paidStatus: {
        title: string
        hexColor: string
    }) => React.ReactNode
}
export function PaidChip({ status, classNames, props, childrenRender }: Props) {
    const { resolvedTheme } = useTheme()

    const backgroundColor =
        resolvedTheme === 'light'
            ? lightenHexColor(
                PAID_STATUS_COLOR[status]?.hexColor
                    ? PAID_STATUS_COLOR[status].hexColor
                    : '#ffffff',
                90
            )
            : darkenHexColor(
                PAID_STATUS_COLOR[status]?.hexColor
                    ? PAID_STATUS_COLOR[status].hexColor
                    : '#000000',
                70
            )

    return (
        <Chip
            style={{
                color: PAID_STATUS_COLOR[status]?.hexColor
                    ? PAID_STATUS_COLOR[status].hexColor
                    : '#ffffff',
                backgroundColor: backgroundColor,
                border: '1px solid',
                borderColor: PAID_STATUS_COLOR[status]?.hexColor
                    ? PAID_STATUS_COLOR[status].hexColor
                    : '#ffffff',
            }}
            variant="solid"
            classNames={{
                ...classNames,
                content: cn(
                    'text-xs font-semibold font-saira',
                    classNames?.content
                ),
            }}
            {...props}
        >
            {!childrenRender
                ? PAID_STATUS_COLOR[status].title
                : childrenRender(PAID_STATUS_COLOR[status])}
        </Chip>
    )
}
