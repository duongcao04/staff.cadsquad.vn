import { Button, Kbd, useDisclosure } from '@heroui/react'
import { Link } from '@tanstack/react-router'
import { ChannelProvider } from 'ably/react'
import { Layout } from 'antd'
import hotkeys from 'hotkeys-js'
import { CircleHelpIcon, Search } from 'lucide-react'
import { useEffect } from 'react'

import { useProfile } from '../../../../lib'
import { CHANNELS } from '../../../../lib/ably'
import CadsquadLogo from '../../CadsquadLogo'
import NotificationDropdown from '../../../../features/notifications/components/views/NotificationDropdown'
import { SearchModal } from '../../layouts/Header/SearchModal'
import { SettingsDropdown } from '../../layouts/Header/SettingsDropdown'
import { UserDropdown } from '../../layouts/Header/UserDropdown'
import { HeroButton } from '../../ui/hero-button'

const { Header: AntHeader } = Layout

export const AdminHeader = () => {
    const { profile } = useProfile()
    const { isOpen, onClose, onOpen } = useDisclosure({
        id: 'SearchModal',
    })

    useEffect(() => {
        hotkeys('ctrl+k', function (event) {
            // Prevent the default refresh event under WINDOWS system
            event.preventDefault()
            onOpen()
        })
    }, [])

    return (
        <AntHeader
            style={{
                background: 'var(--background)',
                padding: 0,
                overflow: 'hidden',
                height: '56px',
            }}
            className="shadow-borderSM"
        >
            {/* Logo */}
            <div className="h-14 container grid grid-cols-[200px_1fr_220px] gap-5 items-center">
                <Link
                    to="/admin"
                    className="flex items-end justify-start group"
                >
                    <CadsquadLogo
                        classNames={{
                            logo: 'h-8',
                        }}
                        canRedirect={false}
                    />
                    <p className="pl-1 font-quicksand text-xl text-text-default group-hover:underline">
                        Admin
                    </p>
                </Link>
                <div className="w-full">
                    <div className="w-full flex items-center justify-center">
                        <HeroButton
                            variant="bordered"
                            className="rounded-full! border-text-4 border-1"
                            color="default"
                            onPress={onOpen}
                            startContent={
                                <Search
                                    size={16}
                                    className="text-text-subdued"
                                />
                            }
                            endContent={
                                <Kbd
                                    onKeyDown={() => {
                                        onOpen()
                                    }}
                                    classNames={{
                                        base: 'opacity-85',
                                    }}
                                >
                                    Ctrl + K
                                </Kbd>
                            }
                        >
                            <div className="w-96 text-text-7 tracking-wide">
                                Search
                            </div>
                        </HeroButton>
                    </div>
                    {isOpen && (
                        <SearchModal isOpen={isOpen} onClose={onClose} />
                    )}
                </div>

                <div className="h-full flex justify-end items-center gap-3">
                    <div className="flex items-center justify-end gap-3">
                        {profile.id && (
                            <ChannelProvider
                                channelName={CHANNELS.userNotificationsKey(
                                    profile.id
                                )}
                            >
                                <NotificationDropdown />
                            </ChannelProvider>
                        )}
                        <Button
                            variant="light"
                            startContent={<CircleHelpIcon size={18} />}
                            size="sm"
                            isIconOnly
                            onPress={() => console.log('Help clicked')}
                        />
                        <SettingsDropdown />
                    </div>

                    <div className="h-[50%] w-[1.5px] bg-border ml-1.5 mr-3" />

                    <UserDropdown />
                </div>
            </div>
        </AntHeader>
    )
}
