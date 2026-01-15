import { APP_TEXT_SCALING, APP_THEME_COLORS, STORAGE_KEYS } from '@/lib/utils'
import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColorKey = keyof typeof APP_THEME_COLORS
export type TextScalingKey = keyof typeof APP_TEXT_SCALING
export type ThemeMotion = '0' | '1'

interface AppThemeContextType {
    themeColor: ThemeColorKey
    textScaling: TextScalingKey
    themeMotion: boolean // Boolean use in UI
    setThemeColor: (color: ThemeColorKey) => void
    setTextScaling: (size: TextScalingKey) => void
    setThemeMotion: (state: boolean) => void
    resetDefault: () => void
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(
    undefined
)

export const AppThemeProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [themeColor, setThemeColorState] = useState<ThemeColorKey>('blue')
    const [textScalingSize, setTextScalingSize] =
        useState<TextScalingKey>('medium')
    const [themeMotionState, setThemeMotionState] = useState<ThemeMotion>('1')
    const [isMounted, setIsMounted] = useState(false)

    // Helper to apply styles to :root
    const applyThemeToRoot = (key: ThemeColorKey) => {
        const themeParams = APP_THEME_COLORS[key]
        const root = document.documentElement
        Object.entries(themeParams).forEach(([property, value]) => {
            root.style.setProperty(property, value as string)
        })
    }

    const applyTextScaling = (key: TextScalingKey) => {
        const sizeValue = APP_TEXT_SCALING[key]
        document.documentElement.style.setProperty('font-size', sizeValue)
    }

    const applyThemeMotion = (state: ThemeMotion) => {
        localStorage.setItem(STORAGE_KEYS.themeMotion, state)
        if (state === '0') {
            document.documentElement.classList.add('reduce-motion')
        } else {
            document.documentElement.classList.remove('reduce-motion')
        }
    }

    useEffect(() => {
        const storedColor = localStorage.getItem(
            STORAGE_KEYS.themeColor
        ) as ThemeColorKey
        const storedScaling = localStorage.getItem(
            STORAGE_KEYS.themeText
        ) as TextScalingKey
        const storedMotion = localStorage.getItem(
            STORAGE_KEYS.themeMotion
        ) as ThemeMotion

        if (storedColor && APP_THEME_COLORS[storedColor]) {
            setThemeColorState(storedColor)
            applyThemeToRoot(storedColor)
        } else {
            applyThemeToRoot('blue')
        }

        if (storedScaling && APP_TEXT_SCALING[storedScaling]) {
            setTextScalingSize(storedScaling)
            applyTextScaling(storedScaling)
        } else {
            applyTextScaling('medium')
        }

        if (storedMotion) {
            setThemeMotionState(storedMotion)
            applyThemeMotion(storedMotion)
        } else {
            setThemeMotionState('1')
            applyThemeMotion('1')
        }

        setIsMounted(true)
    }, [])

    const setThemeColor = (color: ThemeColorKey) => {
        setThemeColorState(color)
        localStorage.setItem(STORAGE_KEYS.themeColor, color)
        applyThemeToRoot(color)
    }

    const setTextScaling = (size: TextScalingKey) => {
        setTextScalingSize(size)
        localStorage.setItem(STORAGE_KEYS.themeText, size)
        applyTextScaling(size)
    }

    const setThemeMotion = (enabled: boolean) => {
        const value: ThemeMotion = enabled ? '1' : '0'
        setThemeMotionState(value)
        applyThemeMotion(value)
    }
    const resetDefault = () => {
        setThemeColor('blue')
        setTextScaling('medium')
        setThemeMotion(true)
    }

    return (
        <AppThemeContext.Provider
            value={{
                themeColor,
                textScaling: textScalingSize,
                // FIX: Boolean("0") is true in JS. Must compare string value.
                themeMotion: themeMotionState === '1',
                setThemeColor,
                setTextScaling,
                setThemeMotion,
                resetDefault,
            }}
        >
            <div
                className={`w-screen h-screen bg-background text-foreground font-sans transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}
            >
                {children}
            </div>
        </AppThemeContext.Provider>
    )
}

export const useAppTheme = () => {
    const context = useContext(AppThemeContext)
    if (!context)
        throw new Error('useAppTheme must be used within a AppThemeProvider')
    return context
}
