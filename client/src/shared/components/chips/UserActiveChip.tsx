import { Chip, type ChipProps } from '@heroui/react'
import { useTheme } from 'next-themes'

import { cn, darkenHexColor, lightenHexColor } from '@/lib/utils'

const userActiveStatus = {
    activated: {
        title: 'Activated',
        hexColor: '#589981',
    },
    unActivated: {
        title: 'UnActivated',
        hexColor: '#f32013',
    },
}

type Props = {
    status: 'activated' | 'unActivated'
    classNames?: ChipProps['classNames']
    props?: ChipProps
}
export function UserActiveChip({ status, classNames, props }: Props) {
    const { resolvedTheme } = useTheme()

    const backgroundColor =
        resolvedTheme === 'light'
            ? lightenHexColor(
                  userActiveStatus[status]?.hexColor
                      ? userActiveStatus[status].hexColor
                      : '#ffffff',
                  90
              )
            : darkenHexColor(
                  userActiveStatus[status]?.hexColor
                      ? userActiveStatus[status].hexColor
                      : '#000000',
                  70
              )
    return (
        <Chip
            style={{
                color: userActiveStatus[status]?.hexColor
                    ? userActiveStatus[status].hexColor
                    : '#ffffff',
                backgroundColor: backgroundColor,
                border: '1px solid',
                borderColor: userActiveStatus[status]?.hexColor
                    ? userActiveStatus[status].hexColor
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
            {userActiveStatus[status].title}
        </Chip>
    )
}
