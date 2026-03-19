import { Autocomplete, AutocompleteItem, Avatar } from '@heroui/react'
import { SearchIcon } from 'lucide-react'
import { type Key, memo, useMemo, useState, useEffect, useRef } from 'react'

import { optimizeCloudinary } from '@/lib/cloudinary'
import type { TUser } from '@/shared/types'

interface Props {
    users: TUser[]
    assignees?: TUser[] // Current members from Formik
    onSelectMember: (userIds: string[]) => void
    loading?: boolean
}

const AssignMemberField = memo(function AssignMemberField({
    users,
    assignees = [],
    onSelectMember,
    loading = false,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [inputValue, setInputValue] = useState('')

    // 1. Map current assignees to a Set of IDs for O(1) lookup
    const assignedUserIds = useMemo(() => {
        const safeAssignees = Array.isArray(assignees) ? assignees : []
        return new Set(safeAssignees.map((u) => u.id))
    }, [assignees])

    // 2. Internal state to track selected users for the Autocomplete logic
    const [selectedUsers, setSelectedUsers] =
        useState<Set<string>>(assignedUserIds)

    // 3. FIX: Sync state when parent removes a member
    useEffect(() => {
        setSelectedUsers(assignedUserIds)
    }, [assignedUserIds])

    // 4. Filter users that haven't been assigned yet
    const availableUsers = useMemo(() => {
        if (!Array.isArray(users)) return []

        const search = inputValue.trim().toLowerCase()
        const results: TUser[] = []

        for (const user of users) {
            if (results.length >= 50) break // Performance cap
            if (selectedUsers.has(user.id)) continue // Skip already assigned

            if (!search) {
                results.push(user)
                continue
            }

            const fullText = `${user.displayName} ${user.email} ${
                user.username
            } ${user.department?.displayName || ''}`.toLowerCase()

            if (fullText.includes(search)) {
                results.push(user)
            }
        }
        return results
    }, [users, selectedUsers, inputValue])

    const handleSelectionChange = (key: Key | null) => {
        if (!key) return
        const newKey = String(key)

        // Add to the set and propagate to Formik
        const newSelectedUsers = new Set([...selectedUsers, newKey])
        setSelectedUsers(newSelectedUsers)
        onSelectMember(Array.from(newSelectedUsers))

        // Reset search input
        setTimeout(() => {
            setInputValue('')
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur()
            }
        }, 50)
    }

    return (
        <div className="flex flex-col gap-3">
            <Autocomplete
                aria-label="Select member"
                classNames={{
                    base: 'w-full',
                    listboxWrapper: 'max-h-[320px]',
                    selectorButton: 'text-default-500',
                }}
                listboxProps={{
                    hideSelectedIcon: true,
                }}
                ref={inputRef}
                items={availableUsers}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSelectionChange={handleSelectionChange}
                placeholder="Type to search & add members..."
                radius="full"
                variant="bordered"
                isLoading={loading}
                startContent={
                    <SearchIcon className="text-default-400" size={18} />
                }
                allowsCustomValue={false}
                isClearable={false}
            >
                {(user) => (
                    <AutocompleteItem
                        key={user.id}
                        textValue={user.displayName}
                    >
                        <div className="flex gap-2 items-center">
                            <Avatar
                                alt={user.displayName}
                                className="shrink-0"
                                size="sm"
                                src={optimizeCloudinary(user.avatar ?? '')}
                            />
                            <div className="flex flex-col">
                                <span className="text-small font-medium">
                                    {user.displayName}
                                </span>
                                <span className="text-tiny text-default-400">
                                    {user.department?.displayName || user.email}
                                </span>
                            </div>
                        </div>
                    </AutocompleteItem>
                )}
            </Autocomplete>
        </div>
    )
})

export default AssignMemberField
