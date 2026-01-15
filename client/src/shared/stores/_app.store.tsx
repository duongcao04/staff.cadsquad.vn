import { Store } from '@tanstack/store'

import { STORAGE_KEYS } from '../../lib'

// 1. Runtime Constant Object
export const ESidebarStatus = {
    EXPAND: 'expand',
    COLLAPSE: 'collapse',
} as const

// 2. Type Definition
export type ESidebarStatus =
    (typeof ESidebarStatus)[keyof typeof ESidebarStatus]

export type SidebarStatus = 'expand' | 'collapse'

/**
 * Generic helper to get initial status from localStorage
 */
const getInitialStatus = (
    key: string,
    fallback: SidebarStatus = ESidebarStatus.EXPAND
): SidebarStatus => {
    if (typeof window === 'undefined') return fallback

    const stored = localStorage.getItem(key)

    if (
        stored === ESidebarStatus.EXPAND ||
        stored === ESidebarStatus.COLLAPSE
    ) {
        return stored as SidebarStatus
    }

    return fallback
}

type AppState = {
    sidebarStatus: SidebarStatus // Generic/Main sidebar
    adminLeftStatus: SidebarStatus // Admin Left
    adminRightStatus: SidebarStatus // Admin Right
    communitiesLeftStatus: SidebarStatus // Admin Right
}

// 3. Create Store
export const appStore = new Store<AppState>({
    sidebarStatus: getInitialStatus(STORAGE_KEYS.sidebarStatus),
    adminLeftStatus: getInitialStatus(
        STORAGE_KEYS.adminLeftSidebar,
        ESidebarStatus.EXPAND
    ),
    adminRightStatus: getInitialStatus(
        STORAGE_KEYS.adminRightSidebar,
        ESidebarStatus.EXPAND
    ),
    communitiesLeftStatus: getInitialStatus(
        STORAGE_KEYS.communitiesLeftStatus,
        ESidebarStatus.EXPAND
    ),
})

// 4. Actions

// --- Main Sidebar ---
export const setSidebarStatus = (status: SidebarStatus) => {
    localStorage.setItem(STORAGE_KEYS.sidebarStatus, status)
    appStore.setState((state) => ({
        ...state,
        sidebarStatus: status,
    }))
}

export const toggleSidebar = () => {
    appStore.setState((state) => {
        const nextStatus =
            state.sidebarStatus === ESidebarStatus.EXPAND
                ? ESidebarStatus.COLLAPSE
                : ESidebarStatus.EXPAND

        localStorage.setItem(STORAGE_KEYS.sidebarStatus, nextStatus)

        return {
            ...state,
            sidebarStatus: nextStatus,
        }
    })
}

// --- Admin Left Sidebar ---
export const toggleAdminLeftSidebar = () => {
    appStore.setState((state) => {
        const nextStatus =
            state.adminLeftStatus === ESidebarStatus.EXPAND
                ? ESidebarStatus.COLLAPSE
                : ESidebarStatus.EXPAND

        localStorage.setItem(STORAGE_KEYS.adminLeftSidebar, nextStatus)

        return {
            ...state,
            adminLeftStatus: nextStatus,
        }
    })
}

// --- Admin Right Sidebar ---
export const toggleAdminRightSidebar = () => {
    appStore.setState((state) => {
        const nextStatus =
            state.adminRightStatus === ESidebarStatus.EXPAND
                ? ESidebarStatus.COLLAPSE
                : ESidebarStatus.EXPAND

        localStorage.setItem(STORAGE_KEYS.adminRightSidebar, nextStatus)

        return {
            ...state,
            adminRightStatus: nextStatus,
        }
    })
}
