import { Chip, type ChipProps } from '@heroui/react'
import { useTheme } from 'next-themes'

import { cn, darkenHexColor, lightenHexColor } from '@/lib/utils'
import { type TJobStatus } from '@/shared/types'

type Props = {
    data: TJobStatus
    classNames?: ChipProps['classNames']
    props?: ChipProps
    childrenRender?: (status: TJobStatus) => React.ReactNode
}
export function JobStatusChip({
    data,
    classNames,
    props,
    childrenRender,
}: Props) {
    const { resolvedTheme } = useTheme()

    const backgroundColor =
        resolvedTheme === 'light'
            ? lightenHexColor(data?.hexColor ? data.hexColor : '#ffffff', 90)
            : darkenHexColor(data?.hexColor ? data.hexColor : '#000000', 70)

    return (
        <Chip
            style={{
                color: data?.hexColor ? data.hexColor : '#ffffff',
                backgroundColor: backgroundColor,
                border: '1px solid',
                borderColor: data?.hexColor ? data.hexColor : '#ffffff',
            }}
            variant="solid"
            classNames={{
                ...classNames,
                content: cn(
                    'uppercase text-xs font-semibold font-saira',
                    classNames?.content
                ),
            }}
            {...props}
        >
            {!childrenRender ? data?.displayName : childrenRender(data)}
        </Chip>
    )
}
