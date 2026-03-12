import { Chip, type ChipProps } from '@heroui/react'
import { useTheme } from 'next-themes'

import { cn, darkenHexColor, lightenHexColor } from '@/lib/utils'
import { type TDepartment } from '@/shared/types'

type Props = {
    data: TDepartment
    classNames?: ChipProps['classNames']
    props?: ChipProps
}
export function DepartmentChip({ data, classNames, props }: Props) {
    const { resolvedTheme } = useTheme()

    const backgroundColor =
        resolvedTheme === 'light'
            ? lightenHexColor(data?.hexColor ? data.hexColor : '#ffffff', 90)
            : darkenHexColor(data?.hexColor ? data.hexColor : '#000000', 70)

    const isUnknown = data.code === 'UNKNOWN'
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
                    'text-xs font-medium font-saira',
                    classNames?.content
                ),
            }}
            {...props}
        >
            <div
                className="flex items-center justify-start gap-2 size-full"
                style={{
                    color: isUnknown ? 'var(--text-default)' : '',
                }}
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{
                        backgroundColor: data?.hexColor || 'transparent',
                    }}
                />
                {data.displayName}
            </div>
        </Chip>
    )
}
