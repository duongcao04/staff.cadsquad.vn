import { useSuspenseQuery } from '@tanstack/react-query'
import { Listbox, ListboxItem, Chip } from '@heroui/react'
import {
    ChevronRightIcon,
    BriefcaseIcon,
    UserCircleIcon,
    SettingsIcon,
    UsersIcon,
    BadgeCheck,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { searchOptions, SearchCategory, useProfile } from '@/lib/queries'

interface SearchResultsProps {
    query: string
    category: SearchCategory
    onSelect: () => void
}

export const SearchResults = ({
    query,
    category,
    onSelect,
}: SearchResultsProps) => {
    const navigate = useNavigate()
    const { isAdmin } = useProfile()
    const { data } = useSuspenseQuery(searchOptions(query, category, isAdmin))

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-12 text-default-400 gap-2">
                <p className="text-sm">No results found.</p>
            </div>
        )
    }

    const handleSelect = (route: string) => {
        navigate({ to: route })
        onSelect()
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Jobs':
                return <BriefcaseIcon size={16} />
            case 'Clients':
                return <UserCircleIcon size={16} />
            case 'System':
                return <SettingsIcon size={16} />
            case 'Communities':
                return <UsersIcon size={16} />
            case 'Staff Members':
                return <BadgeCheck size={16} />
            default:
                return <SettingsIcon size={16} />
        }
    }

    return (
        <Listbox
            aria-label="Search results"
            onAction={(key) => handleSelect(key as string)}
            variant="flat"
            className="p-0 gap-1"
        >
            {data.map((item: any) => (
                <ListboxItem
                    key={item.route || item.id}
                    textValue={item.title}
                    className="px-3 py-2.5 rounded-lg group"
                    startContent={
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-default-100 text-default-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {getIcon(item.type)}
                        </div>
                    }
                    endContent={
                        <ChevronRightIcon
                            size={14}
                            className="text-default-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    }
                >
                    <div className="flex justify-between items-center w-full pl-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-small text-default-900 line-clamp-1">
                                {item.title}
                            </span>
                            {item.subtitle && (
                                <span className="text-tiny text-default-400 line-clamp-1">
                                    {item.subtitle}
                                </span>
                            )}
                        </div>
                        {/* Only show chip if we are in 'All' view to distinguish types */}
                        {category === 'All' && (
                            <Chip
                                size="sm"
                                variant="flat"
                                className="capitalize text-[10px] h-5 ml-2 border-none hidden sm:flex"
                            >
                                {item.type}
                            </Chip>
                        )}
                    </div>
                </ListboxItem>
            ))}
        </Listbox>
    )
}
