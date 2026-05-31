import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    SharedSelection,
} from '@heroui/react'
import { ChevronDown, LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

export type ViewOption = {
    key: string
    label: string
    icon: LucideIcon
    description?: string
}

interface Props {
    selectedKey: string
    onSelectionChange: (key: string) => void
    options: ViewOption[]
    className?: string
}

export default function ViewContentDropdown({
    selectedKey,
    onSelectionChange,
    options,
    className,
}: Props) {
    // 1. Handle Selection Logic
    const handleSelectionChange = (keys: SharedSelection) => {
        const newKey = Array.from(keys)[0] as string
        if (newKey) {
            onSelectionChange(newKey)
        }
    }

    // 2. Find Current Option Data for the Button Label
    const currentOption = useMemo(() => {
        return options.find((opt) => opt.key === selectedKey) || options[0]
    }, [selectedKey, options])

    const Icon = currentOption?.icon

    return (
        <Dropdown placement="bottom-end">
            <DropdownTrigger>
                <Button
                    variant="bordered"
                    className={`border-1 capitalize min-w-32.5 justify-between ${className}`}
                    startContent={
                        Icon ? (
                            <Icon size={16} className="text-default-500" />
                        ) : null
                    }
                    endContent={
                        <ChevronDown size={14} className="text-default-400" />
                    }
                >
                    {currentOption?.label}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label="View layout options"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={new Set([selectedKey])}
                onSelectionChange={handleSelectionChange}
                variant="flat"
            >
                {options.map((option) => (
                    <DropdownItem
                        key={option.key}
                        startContent={
                            <option.icon
                                size={18}
                                className="text-default-500"
                            />
                        }
                        description={option.description}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}
