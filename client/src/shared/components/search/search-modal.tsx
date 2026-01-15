import { SearchCategory, useProfile } from '@/lib/queries'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '@/shared/components/ui/hero-modal'
import { Divider, Input, Kbd, Spinner, Tab, Tabs } from '@heroui/react'
import {
    BadgeCheck,
    BriefcaseIcon,
    HistoryIcon,
    LayoutGridIcon,
    SearchIcon,
    SettingsIcon,
    UserCircleIcon,
    UsersIcon,
} from 'lucide-react'
import { Suspense, useDeferredValue, useState } from 'react'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { SearchResults } from './search-results'

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<SearchCategory>('All')
    const deferredQuery = useDeferredValue(query)
    const isStale = query !== deferredQuery

    const { isAdmin } = useProfile()

    return (
        <HeroModal
            isOpen={isOpen}
            onOpenChange={onClose}
            hideCloseButton
            placement="top"
            size="2xl"
            classNames={{
                base: 'mt-[10vh] border border-default-200 shadow-2xl overflow-hidden',
                backdrop: 'bg-zinc-900/40 backdrop-blur-sm',
            }}
        >
            <HeroModalContent>
                <HeroModalHeader className="flex items-center px-4 pt-4 pb-2">
                    <Input
                        autoFocus
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search everything..."
                        variant="flat"
                        size="lg"
                        startContent={
                            <SearchIcon
                                className={`text-default-400 transition-opacity ${isStale ? 'opacity-50' : 'opacity-100'}`}
                                size={20}
                            />
                        }
                        endContent={
                            isStale ? (
                                <Spinner size="sm" color="default" />
                            ) : (
                                <Kbd
                                    keys={['command']}
                                    className="hidden sm:inline-flex shadow-none bg-default-100"
                                >
                                    K
                                </Kbd>
                            )
                        }
                        classNames={{
                            inputWrapper:
                                'bg-transparent shadow-none border-none pl-1',
                            input: 'text-lg',
                        }}
                    />
                </HeroModalHeader>
                <HeroModalBody className="p-0">
                    {/* Tabs */}
                    <div className="px-4 border-b border-default-100 overflow-x-auto scrollbar-hide">
                        <Tabs
                            aria-label="Search Categories"
                            selectedKey={activeTab}
                            onSelectionChange={(key) =>
                                setActiveTab(key as SearchCategory)
                            }
                            variant="underlined"
                            classNames={{
                                tabList: 'gap-4',
                                cursor: 'w-full bg-primary',
                                tab: 'max-w-fit px-0 h-10',
                                tabContent:
                                    'group-data-[selected=true]:text-primary font-medium text-small',
                            }}
                        >
                            <Tab
                                key="All"
                                title={
                                    <TabHeader
                                        icon={<LayoutGridIcon size={14} />}
                                        text="All"
                                    />
                                }
                            />
                            <Tab
                                key="Jobs"
                                title={
                                    <TabHeader
                                        icon={<BriefcaseIcon size={14} />}
                                        text="Jobs"
                                    />
                                }
                            />
                            {/* TODO: implement search clients */}
                            {false && (
                                <Tab
                                    key="Clients"
                                    title={
                                        <TabHeader
                                            icon={<UserCircleIcon size={14} />}
                                            text="Clients"
                                        />
                                    }
                                />
                            )}
                            <Tab
                                key="System"
                                title={
                                    <TabHeader
                                        icon={<SettingsIcon size={14} />}
                                        text="System"
                                    />
                                }
                            />

                            {/* TODO: implement search clients */}
                            {false && (
                                <Tab
                                    key="Communities"
                                    title={
                                        <TabHeader
                                            icon={<UsersIcon size={14} />}
                                            text="Communities"
                                        />
                                    }
                                />
                            )}
                            {isAdmin && (
                                <Tab
                                    key="Staff Members"
                                    title={
                                        <TabHeader
                                            icon={<BadgeCheck size={14} />}
                                            text="Staff"
                                        />
                                    }
                                />
                            )}
                        </Tabs>
                    </div>

                    {/* Results (Suspense) */}
                    <ScrollArea className="h-[60vh]">
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                        <div className="flex-1 p-2">
                            {!deferredQuery ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-default-400 gap-3 opacity-60">
                                    <HistoryIcon size={48} strokeWidth={1} />
                                    <p className="text-sm">
                                        Start typing to search...
                                    </p>
                                </div>
                            ) : (
                                <Suspense
                                    fallback={
                                        <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
                                            <Spinner
                                                size="lg"
                                                color="current"
                                                className="text-default-400"
                                            />
                                            <p className="text-default-400 text-sm">
                                                Searching...
                                            </p>
                                        </div>
                                    }
                                >
                                    <div
                                        className={
                                            isStale
                                                ? 'opacity-50 transition-opacity duration-200'
                                                : 'opacity-100'
                                        }
                                    >
                                        <SearchResults
                                            query={deferredQuery}
                                            category={activeTab}
                                            onSelect={() => {
                                                setQuery('')
                                                onClose()
                                            }}
                                        />
                                    </div>
                                </Suspense>
                            )}
                        </div>
                    </ScrollArea>
                </HeroModalBody>
                <Divider />
                <HeroModalFooter>
                    <div className="flex gap-3 text-[10px] bg-background-muted">
                        <span className="flex items-center gap-1 text-text-subdued">
                            <Kbd className="h-4 min-h-4 text-[9px] px-1">
                                ESC
                            </Kbd>
                            Close
                        </span>
                        <span className="flex items-center gap-1 text-text-subdued">
                            <Kbd className="h-4 min-h-4 text-[9px] px-1">↵</Kbd>
                            Select
                        </span>
                    </div>
                </HeroModalFooter>
            </HeroModalContent>
        </HeroModal>
    )
}

const TabHeader = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
        {icon}
        <span>{text}</span>
    </div>
)
