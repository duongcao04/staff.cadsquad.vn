import { SYSTEM_ROUTES } from '@/lib/utils'
import {
    Chip,
    Input,
    Kbd,
    Listbox,
    ListboxItem,
    Spinner,
    Tab,
    Tabs,
} from '@heroui/react'
import { useNavigate } from '@tanstack/react-router'
import {
    BriefcaseIcon,
    ChevronRightIcon,
    HistoryIcon,
    LayoutGridIcon,
    SearchIcon,
    SettingsIcon,
    UserCircleIcon,
    UsersIcon,
} from 'lucide-react'
import React, { useEffect, useState, useMemo } from 'react'
import { HeroModal, HeroModalBody, HeroModalContent } from '../../ui/hero-modal'

// --- Types ---
type Category = 'All' | 'Jobs' | 'Communities' | 'Clients' | 'System'

// Unified Interface for Display
interface SearchResultItem {
    id: string
    title: string
    subtitle?: string
    category: Category
    route: string
    icon?: React.ReactNode
    allowRoles: string[]
}

// --- Helpers ---
// 1. Debounce Hook to prevent API spam
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(handler)
    }, [value, delay])
    return debouncedValue
}

// --- SearchModal Component ---
export const SearchModal = ({
    isOpen,
    onClose,
    userRole = 'USER',
}: {
    isOpen: boolean
    onClose: () => void
    userRole?: 'ADMIN' | 'ACCOUNTING' | 'USER'
}) => {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [activeTab, setActiveTab] = useState<Category>('All')
    
    // State for Async Results
    const [asyncResults, setAsyncResults] = useState<SearchResultItem[]>([])
    const [isSearching, setIsSearching] = useState(false)

    // Debounce the query (wait 300ms after typing stops)
    const debouncedQuery = useDebounce(query, 300)

    // --- 1. Fetch Logic ---
    useEffect(() => {
        // If query is empty, clear results and don't fetch
        if (!debouncedQuery.trim()) {
            setAsyncResults([])
            return
        }

        const fetchResults = async () => {
            setIsSearching(true)
            try {
                const results: SearchResultItem[] = []
                const promises: Promise<any>[] = []

                // A. Search Jobs (if Tab is All or Jobs)
                if (activeTab === 'All' || activeTab === 'Jobs') {
                    promises.push(
                        fetch(`/api/jobs/search?q=${encodeURIComponent(debouncedQuery)}`)
                            .then(res => res.json())
                            .then((data) => {
                                // Map Backend Job -> SearchResultItem
                                const jobs = data.map((job: any) => ({
                                    id: `job-${job.id}`,
                                    title: job.displayName || job.no, // e.g. "J-24001: Website Redesign"
                                    subtitle: job.client?.name || 'Unknown Client',
                                    category: 'Jobs',
                                    route: `/jobs/${job.no}`, // Navigate to Job Detail
                                    icon: <BriefcaseIcon size={18} />,
                                    allowRoles: ['ADMIN', 'USER', 'ACCOUNTING'] // Adjust permissions
                                }))
                                results.push(...jobs)
                            })
                            .catch(err => console.error("Job search failed", err))
                    )
                }

                // B. Search Clients (if Tab is All or Clients)
                if (activeTab === 'All' || activeTab === 'Clients') {
                    promises.push(
                        fetch(`/api/clients/search?q=${encodeURIComponent(debouncedQuery)}`)
                            .then(res => res.json())
                            .then((data) => {
                                // Map Backend Client -> SearchResultItem
                                const clients = data.map((client: any) => ({
                                    id: `client-${client.id}`,
                                    title: client.name,
                                    subtitle: client.code ? `Code: ${client.code}` : undefined,
                                    category: 'Clients',
                                    route: `/clients/${client.id}`,
                                    icon: <UserCircleIcon size={18} />,
                                    allowRoles: ['ADMIN', 'USER', 'ACCOUNTING']
                                }))
                                results.push(...clients)
                            })
                            .catch(err => console.error("Client search failed", err))
                    )
                }

                await Promise.all(promises)
                setAsyncResults(results)
            } catch (error) {
                console.error("Search error", error)
            } finally {
                setIsSearching(false)
            }
        }

        fetchResults()
    }, [debouncedQuery, activeTab])


    // --- 2. Combine & Filter Results ---
    const displayedResults = useMemo(() => {
        // A. Static System Routes (Always filter locally)
        // Map your existing SYSTEM_ROUTES to the SearchResultItem interface if needed
        const staticItems = SYSTEM_ROUTES
            .filter(item => {
                const matchesRole = item.allowRoles.includes(userRole)
                const matchesTab = activeTab === 'All' || item.category === activeTab
                // If query exists, filter by text. If empty, show all allowed static routes (optional)
                const matchesQuery = !query 
                    ? true // Show default links when empty? Or false to hide.
                    : (item.title.toLowerCase().includes(query.toLowerCase()) || 
                       item.subtitle?.toLowerCase().includes(query.toLowerCase()))
                
                return matchesRole && matchesTab && matchesQuery
            })
            .map(item => ({
                ...item,
                id: `static-${item.route}`,
                // Ensure icon exists or provide default
                icon: item.icon || <SettingsIcon size={18} />
            })) as SearchResultItem[]

        // B. Combine with Async API Results
        // (Async results are already filtered by the API query and logic above)
        return [...staticItems, ...asyncResults]

    }, [asyncResults, query, activeTab, userRole])


    const handleSelect = (route: string) => {
        navigate({ to: route })
        setQuery('')
        onClose()
    }

    return (
        <HeroModal
            isOpen={isOpen}
            onOpenChange={onClose}
            hideCloseButton
            placement="top"
            size="2xl"
            classNames={{
                base: 'mt-[8vh] bg-background border border-default-200 shadow-2xl overflow-hidden',
                backdrop: 'bg-zinc-900/50 backdrop-blur-sm',
            }}
        >
            <HeroModalContent>
                <HeroModalBody className="p-0">
                    {/* --- Search Input Section --- */}
                    <div className="flex items-center px-4 pt-4">
                        <Input
                            autoFocus
                            placeholder="Search jobs, clients, or pages..."
                            variant="flat"
                            startContent={<SearchIcon className="text-default-400" size={20} />}
                            endContent={
                                isSearching ? (
                                    <Spinner size="sm" color="default" />
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <Kbd keys={['command']} className="hidden sm:inline-flex">K</Kbd>
                                    </div>
                                )
                            }
                            classNames={{
                                inputWrapper: 'bg-transparent shadow-none border-none',
                                input: 'text-lg h-12',
                            }}
                            value={query}
                            onValueChange={setQuery}
                        />
                    </div>

                    {/* --- Tabs Section --- */}
                    <div className="px-4 pb-2 border-b border-default-100">
                        <Tabs
                            variant="underlined"
                            aria-label="Search Categories"
                            selectedKey={activeTab}
                            onSelectionChange={(key) => {
                                setActiveTab(key as Category)
                                // Optional: Clear async results immediately on tab switch to avoid mismatch
                                // setAsyncResults([]) 
                            }}
                            classNames={{
                                tabList: 'gap-4',
                                cursor: 'w-full bg-primary',
                                tab: 'max-w-fit px-0 h-10',
                                tabContent: 'group-data-[selected=true]:text-primary font-medium',
                            }}
                        >
                            <Tab key="All" title={<TabHeader icon={<LayoutGridIcon size={16} />} text="All" />} />
                            <Tab key="Jobs" title={<TabHeader icon={<BriefcaseIcon size={16} />} text="Jobs" />} />
                            <Tab key="Clients" title={<TabHeader icon={<UserCircleIcon size={16} />} text="Clients" />} />
                            <Tab key="System" title={<TabHeader icon={<SettingsIcon size={16} />} text="System" />} />
                        </Tabs>
                    </div>

                    {/* --- Results Section --- */}
                    <div className="max-h-112.5 overflow-y-auto p-2 scrollbar-hide min-h-[300px]">
                        {displayedResults.length > 0 ? (
                            <Listbox
                                aria-label="Search results"
                                onAction={(key) => handleSelect(key as string)}
                                variant="flat"
                            >
                                {displayedResults.map((item) => (
                                    <ListboxItem
                                        key={item.route} // Use Route as key for navigation
                                        className="py-3 px-4 rounded-xl group"
                                        textValue={item.title}
                                        startContent={
                                            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-default-100 text-default-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                {item.icon}
                                            </div>
                                        }
                                        endContent={<ChevronRightIcon size={14} className="text-default-300" />}
                                    >
                                        <div className="flex justify-between items-center w-full ml-1">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-default-900 leading-tight">
                                                    {item.title}
                                                </span>
                                                {item.subtitle && (
                                                    <span className="text-tiny text-default-400 line-clamp-1">
                                                        {item.subtitle}
                                                    </span>
                                                )}
                                            </div>
                                            {activeTab === 'All' && (
                                                <Chip size="sm" variant="flat" className="capitalize text-[10px] h-5 ml-2">
                                                    {item.category}
                                                </Chip>
                                            )}
                                        </div>
                                    </ListboxItem>
                                ))}
                            </Listbox>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-default-400 gap-2 h-full">
                                {isSearching ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Spinner size="lg" />
                                        <p className="text-sm">Searching...</p>
                                    </div>
                                ) : (
                                    <>
                                        {query ? (
                                            <>
                                                <SearchIcon size={40} className="opacity-10" />
                                                <p className="text-sm">No results found for "{query}"</p>
                                            </>
                                        ) : (
                                            <>
                                                <HistoryIcon size={40} className="opacity-10" />
                                                <p className="text-sm">Type to search...</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- Footer Guide --- */}
                    <div className="px-4 py-2.5 border-t border-default-100 bg-default-50/50 flex justify-between items-center">
                        <div className="flex gap-4">
                            <span className="text-[10px] text-default-400 flex items-center gap-1">
                                <Kbd className="py-0 px-1 text-[10px]">ESC</Kbd> Close
                            </span>
                            <span className="text-[10px] text-default-400 flex items-center gap-1">
                                <Kbd className="py-0 px-1 text-[10px]">↵</Kbd> Select
                            </span>
                        </div>
                    </div>
                </HeroModalBody>
            </HeroModalContent>
        </HeroModal>
    )
}

const TabHeader = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-2">
        {icon}
        <span>{text}</span>
    </div>
)