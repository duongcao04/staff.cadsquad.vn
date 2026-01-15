import { cn, darkenHexColor, lightenHexColor } from '@/lib/utils'
import { Chip, type ChipProps } from '@heroui/react'
import { useTheme } from 'next-themes'
import { TRole } from '../../types'

type Props = {
    data: TRole
    classNames?: ChipProps['classNames']
    isBordered?: boolean
} & ChipProps
export function RoleChip({
    data,
    classNames,
    isBordered = false,
    ...props
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
                border: isBordered ? '1px solid' : '',
                borderColor: data?.hexColor ? data.hexColor : '#ffffff',
            }}
            variant="solid"
            classNames={{
                ...classNames,
                content: cn('text-xs font-semibold px-4', classNames?.content),
            }}
            {...props}
        >
            {data.displayName}
        </Chip>
    )
}
