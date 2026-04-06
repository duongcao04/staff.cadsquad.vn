import { ablyClient } from '@/lib/ably'
import { queryClient } from '@/main'
import { AppLoading } from '@/shared/components'
import {
    AppThemeProvider,
    useAppTheme,
} from '@/shared/contexts/AppThemeContext'
import { HeroUIProvider, ToastProvider } from '@heroui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
    createRootRouteWithContext,
    HeadContent,
    Outlet,
} from '@tanstack/react-router'
import { AblyProvider } from 'ably/react'
import { ConfigProvider } from 'antd'
import { ThemeProvider } from 'antd-style'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// 1. Định nghĩa Interface cho Context
interface AppRouterContext {
    queryClient: QueryClient
}
export const Route = createRootRouteWithContext<AppRouterContext>()({
    pendingComponent: () => {
        return <AppLoading />
    },
    component: () => {
        return (
            <>
                <HeadContent />
                <AppThemeProvider>
                    <AblyProvider client={ablyClient}>
                        <QueryClientProvider client={queryClient}>
                            <NextThemesProvider
                                attribute="class"
                                defaultTheme="light"
                                enableSystem={true}
                            >
                                <HeroUIConfigurationProvider>
                                    <AntdProvider>
                                        <ToastProvider
                                            placement="bottom-right"
                                            maxVisibleToasts={1}
                                            toastOffset={20}
                                            toastProps={{
                                                radius: 'sm',
                                                timeout: 4000,
                                                variant: 'bordered',
                                                classNames: {
                                                    closeButton:
                                                        'opacity-100 absolute right-4 top-1/2 -translate-y-1/2',
                                                },
                                            }}
                                            regionProps={{
                                                classNames: {
                                                    base: '!z-[10000]',
                                                },
                                            }}
                                        />
                                        <div
                                            id="app"
                                            className="max-w-screen bg-background-muted scroll-smooth"
                                        >
                                            {/* hidden scrollbar */}
                                            {/* <style jsx global>{`
                                            body::-webkit-scrollbar {
                                                display: none;
                                            }
                                        `}</style> */}
                                            <Outlet />
                                        </div>
                                    </AntdProvider>
                                </HeroUIConfigurationProvider>
                            </NextThemesProvider>

                            <ReactQueryDevtools />
                            {/* <TanStackRouterDevtools /> */}
                        </QueryClientProvider>
                    </AblyProvider>
                </AppThemeProvider>
            </>
        )
    },
})

function AntdProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ConfigProvider
                theme={{
                    components: {
                        Table: {
                            headerBg: 'var(--color-background2)',
                        },
                        Tabs: {
                            horizontalMargin: '0',
                        },
                        Select: {
                            selectorBg: 'var(--color-background)',
                            optionSelectedColor: 'var(--color-primary)',
                            activeBorderColor: 'var(--color-primary)',
                            hoverBorderColor: 'var(--color-primary)',
                            borderRadius: 12,
                            controlPaddingHorizontal: 20,
                            controlHeight: 38,
                        },
                        DatePicker: {
                            colorBgContainer: 'var(--color-background)',
                            activeBorderColor: 'var(--color-primary)',
                            hoverBorderColor: 'var(--color-primary)',
                            borderRadiusLG: 12,
                        },
                    },
                }}
                drawer={{
                    classNames: {
                        wrapper: '!p-2.5 !shadow-none !bg-transparent',
                        content:
                            'rounded-lg shadow-lg !bg-background-muted !text-text-default',
                        body: '!py-3 !px-5',
                    },
                    styles: {
                        header: {
                            paddingInline: 16,
                            paddingBlock: 12,
                        },
                    },
                }}
                modal={{
                    classNames: {
                        content: 'shadow-lg',
                    },
                    style: {
                        top: 80,
                    },
                    styles: {
                        mask: {
                            background: '#000000c0',
                        },
                        content: {
                            borderRadius: '24px',
                        },
                    },
                }}
                select={{
                    style: {
                        MozOutlineRadius: 10,
                    },
                    styles: {
                        root: {
                            borderStartStartRadius: 10,
                            backgroundColor:
                                'var(--color-background) !important',
                        },
                    },
                    classNames: {
                        root: '!rounded-2xl !bg-background',
                    },
                }}
                avatar={{
                    style: {},
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeProvider>
    )
}

function HeroUIConfigurationProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const { themeMotion } = useAppTheme()
    return (
        <HeroUIProvider disableAnimation={!themeMotion}>
            {children}
        </HeroUIProvider>
    )
}
