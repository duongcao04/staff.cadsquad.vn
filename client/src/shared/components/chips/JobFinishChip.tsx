import { Chip, ChipProps } from '@heroui/react'

import { cn } from '@/lib'

type Props = ChipProps & {
    status: 'completed' | 'finish'
}

export default function JobFinishChip({ status, ...props }: Props) {
    return (
        <Chip
            variant="dot"
            classNames={{
                ...props.classNames,
                dot: cn(
                    status === 'completed' ? 'bg-blue-500' : 'bg-success',
                    'hidden',
                    props.classNames?.dot
                ),
                base: cn(
                    'w-full! max-w-full! flex items-center justify-end gap-2 border-none',
                    props.classNames?.base
                ),
                content: cn(
                    status === 'completed'
                        ? 'text-blue-700'
                        : 'text-success-700',
                    'font-bold text-xs text-right',
                    props.classNames?.content
                ),
            }}
            {...props}
        >
            {status === 'completed' ? 'Completed' : 'Finish'}
        </Chip>
    )
}
