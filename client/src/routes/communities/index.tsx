import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/communities/')({
    component: CommunitiesIndexPage,
})
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Image,
    Input,
    useDisclosure,
} from '@heroui/react'
import {
    MessageSquareIcon,
    PlusIcon,
    SearchIcon,
    UsersIcon,
} from 'lucide-react'
import { useState } from 'react'

import { CreateCommunityModal } from '../../features/communities/components/modals/CreateCommunityModal'

// --- Mock Data (Based on your Prisma Schema) ---
// In a real app, fetch this via TanStack Query or useEffect
const MOCK_COMMUNITIES = [
    {
        id: 'c-sales',
        code: 'SALES_MKT',
        displayName: 'CSD- Sales & Marketing',
        description:
            'Main hub for sales and marketing team updates. Share leads, campaigns, and wins.',
        color: 'bg-pink-600',
        icon: 'S',
        banner: 'https://img.freepik.com/free-vector/abstract-technology-background_23-2148395279.jpg',
        memberCount: 24,
        topicCount: 4,
        isMember: true,
    },
    {
        id: 'c-eng',
        code: 'ENG_DEPT',
        displayName: 'CSD- Engineering Dept',
        description:
            'Engineering, R&D, and technical documentation. blueprints and CAD files.',
        color: 'bg-orange-600',
        icon: 'E',
        banner: 'https://img.freepik.com/free-photo/industrial-design-software-3d-rendering_110488-500.jpg',
        memberCount: 15,
        topicCount: 2,
        isMember: true,
    },
    {
        id: 'c-hr',
        code: 'HR_GEN',
        displayName: 'Human Resources',
        description: 'Company policies, announcements, and employee welfare.',
        color: 'bg-blue-600',
        icon: 'HR',
        banner: 'https://img.freepik.com/free-vector/office-workers-analyzing-researching-business-data_74855-4445.jpg',
        memberCount: 108,
        topicCount: 6,
        isMember: false,
    },
]

export default function CommunitiesIndexPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Filter logic
    const filteredCommunities = MOCK_COMMUNITIES.filter(
        (c) =>
            c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateSubmit = (data: any) => {
        // TODO: Call API to create community
        console.log('Creating:', data)
    }

    return (
        <div className="h-full w-full p-6 flex flex-col gap-6 max-w-7xl mx-auto">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-default-900">
                        Communities
                    </h1>
                    <p className="text-default-500 text-sm">
                        Discover teams, projects, and discussions across your
                        organization.
                    </p>
                </div>
                <Button
                    color="primary"
                    endContent={<PlusIcon size={18} />}
                    onPress={onOpen}
                >
                    New Community
                </Button>
            </div>

            {/* --- Search & Filter --- */}
            <div className="flex items-center gap-4 bg-default-50 p-4 rounded-xl border border-default-200">
                <Input
                    classNames={{
                        base: 'max-w-md',
                        mainWrapper: 'h-full',
                        input: 'text-small',
                        inputWrapper:
                            'h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20',
                    }}
                    placeholder="Search communities by name or code..."
                    size="sm"
                    startContent={<SearchIcon size={18} />}
                    type="search"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />
                {/* Add generic filters here if needed (e.g. "My Communities" vs "All") */}
            </div>

            {/* --- Grid Layout --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                ))}

                {/* Empty State */}
                {filteredCommunities.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-default-400">
                        <UsersIcon size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">
                            No communities found
                        </p>
                        <p className="text-sm">
                            Try adjusting your search terms.
                        </p>
                    </div>
                )}
            </div>

            {/* --- Create Modal --- */}
            <CreateCommunityModal
                isOpen={isOpen}
                onClose={() => onClose()}
                onSubmit={handleCreateSubmit}
            />
        </div>
    )
}

// --- Sub-Component: Community Card ---
const CommunityCard = ({
    community,
}: {
    community: (typeof MOCK_COMMUNITIES)[0]
}) => {
    return (
        <Card className="w-full hover:scale-[1.01] transition-transform duration-200 cursor-pointer border border-default-200 shadow-sm hover:shadow-md">
            {/* Banner Image */}
            <div className="relative h-24 w-full bg-default-100 overflow-hidden">
                {community.banner ? (
                    <Image
                        removeWrapper
                        alt="Banner"
                        className="z-0 w-full h-full object-cover"
                        src={community.banner}
                    />
                ) : (
                    <div className={`w-full h-full ${community.color}`} />
                )}

                {/* Floating Icon */}
                <div
                    className={`absolute -bottom-6 left-4 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-background ${community.color} z-10`}
                >
                    {community.icon}
                </div>
            </div>

            <CardHeader className="pt-8 px-4 pb-2 flex justify-between items-start">
                <div className="flex flex-col">
                    <h4 className="font-bold text-large text-default-900 line-clamp-1">
                        {community.displayName}
                    </h4>
                    <span className="text-tiny text-default-400 font-mono uppercase">
                        #{community.code}
                    </span>
                </div>
                {community.isMember ? (
                    <Chip
                        size="sm"
                        variant="flat"
                        color="success"
                        className="text-xs"
                    >
                        Joined
                    </Chip>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        color="primary"
                        className="h-7 text-xs px-3"
                    >
                        Join
                    </Button>
                )}
            </CardHeader>

            <CardBody className="px-4 py-2">
                <p className="text-small text-default-500 line-clamp-2 h-10">
                    {community.description || 'No description provided.'}
                </p>
            </CardBody>

            <CardFooter className="px-4 py-3 border-t border-default-100 flex items-center gap-4 text-default-400">
                <div className="flex items-center gap-1.5 text-xs">
                    <UsersIcon size={14} />
                    <span>{community.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                    <MessageSquareIcon size={14} />
                    <span>{community.topicCount} topics</span>
                </div>
            </CardFooter>
        </Card>
    )
}
