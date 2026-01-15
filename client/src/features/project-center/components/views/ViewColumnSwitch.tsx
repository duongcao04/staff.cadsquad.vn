import { Spinner, Switch } from '@heroui/react'
import { JobColumnKey } from '../../../../shared/types'

type Props = {
    isSelected: boolean
    onSwitch: (key: JobColumnKey, isSelected: boolean) => void
    colKey: JobColumnKey
    isLoading?: boolean
}
export function ViewColumnSwitch({
    colKey,
    isSelected,
    onSwitch,
    isLoading = false,
}: Props) {
    if (isLoading) {
        return <Spinner size="sm" />
    }
    return (
        <Switch
            size="sm"
            isSelected={isSelected}
            classNames={{
                base: 'bg-background',
            }}
            onValueChange={(isSelected) => {
                onSwitch(colKey, isSelected)
            }}
        />
    )
}
