import { getAllowedJobColumns, STORAGE_KEYS } from '@/lib'
import type { JobColumnKey } from '@/shared/types'
import { Store } from '@tanstack/react-store'

const DEFAULT_COLUMNS: JobColumnKey[] = [
    'thumbnailUrl',
    'no',
    'displayName',
    'totalStaffCost',
    'status',
    'totalStaffCost',
    'staffCost',
    'dueAt',
    'assignments',
    'action',
]

const getInitWorkbenchColumns = (): JobColumnKey[] | 'all' => {
    if (typeof window === 'undefined') return DEFAULT_COLUMNS
    const stored = localStorage.getItem(STORAGE_KEYS.workbenchColumns)
    if (!stored) return DEFAULT_COLUMNS

    try {
        const parsed = JSON.parse(stored)
        return Array.isArray(parsed) && parsed.length > 0
            ? (parsed as JobColumnKey[])
            : DEFAULT_COLUMNS
    } catch (e) {
        return DEFAULT_COLUMNS
    }
}

// 1. Define the State Interface
interface WorkbenchState {
    page: number
    sort: string
    searchKeywords: string
    limit: number
    tableColumns: JobColumnKey[] | 'all'
    selectedKeys: Set<string> | 'all'
}

// 3. Create the Store
export const workbenchStore = new Store<WorkbenchState>({
    page: 1,
    sort: '',
    searchKeywords: '',
    limit: 10,
    tableColumns: getInitWorkbenchColumns(),
    selectedKeys: new Set(),
})

// --- Actions ---

/**
 * Updates the visible columns in the store and persists them to LocalStorage.
 */
export const setWorkbenchColumns = (newColumns: JobColumnKey[] | 'all') => {
    // A. Update Store State
    workbenchStore.setState((prev) => ({
        ...prev,
        tableColumns: newColumns,
    }))

    // B. Persist to LocalStorage
    if (typeof window !== 'undefined') {
        const storageKey =
            STORAGE_KEYS?.workbenchColumns || 'workbench_visible_columns'
        localStorage.setItem(storageKey, JSON.stringify(newColumns))
    }
}

/**
 * Toggle Column Visibility
 * Now checks against the Role to ensure restricted columns are handled correctly
 */
export const toggleWorkbenchColumns = (
    key: JobColumnKey,
    isVisible: boolean,
    userPermissions: string[]
) => {
    workbenchStore.setState((prev) => {
        const currentCols = prev.tableColumns

        // Use helper to get ALL keys the user is actually allowed to see/toggle
        const allowedKeys = getAllowedJobColumns('all', userPermissions).map(
            (c) => c.uid
        )

        let newColumns: JobColumnKey[]

        if (currentCols === 'all') {
            if (isVisible) return prev
            // If currently 'all' and hiding one, we must list all ALLOWED keys minus the one hidden
            newColumns = allowedKeys.filter((k) => k !== key)
        } else {
            if (isVisible) {
                newColumns = currentCols.includes(key)
                    ? currentCols
                    : [...currentCols, key]
            } else {
                newColumns = currentCols.filter((k) => k !== key)
            }
        }

        // Final Sanity Check: Ensure no restricted columns leaked in
        const sanitizedColumns = newColumns.filter((k) =>
            allowedKeys.includes(k)
        )

        // Persist to Storage (Using the correct Workbench Key)
        if (typeof window !== 'undefined') {
            const storageKey =
                STORAGE_KEYS?.workbenchColumns || 'workbench_visible_columns'
            localStorage.setItem(storageKey, JSON.stringify(sanitizedColumns))
        }

        // Return state with correct property name 'tableColumns'
        return { ...prev, tableColumns: sanitizedColumns }
    })
}

/**
 * Reset columns to default ('all')
 */
export const resetWorkbenchColumns = () => {
    setWorkbenchColumns('all')
}

export const resetWorkbenchFilters = () => {
    workbenchStore.setState((prev) => ({
        ...prev,
        page: 1,
        searchKeywords: '',
        sort: '',
    }))
}
