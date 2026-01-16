import { Select, SelectItem, type SelectProps } from '@heroui/react'
import { cn } from '@/lib/utils'

type HeroSelectProps = {
    children: React.ReactNode
} & SelectProps
export const HeroSelect = ({ children, ...props }: HeroSelectProps) => {
    return (
        <Select
            variant={props.variant ?? 'bordered'}
            {...props}
            classNames={{
                trigger: cn('border-[1px]', props.classNames?.trigger),
                label: 'font-medium text-text-subdued',
                selectorIcon: 'right-2',
                ...props.classNames,
            }}
        >
            {children}
        </Select>
    )
}

export { SelectItem as HeroSelectItem }
