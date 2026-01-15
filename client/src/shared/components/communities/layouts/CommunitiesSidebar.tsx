import {
    Button,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    ScrollShadow,
    useDisclosure,
} from '@heroui/react'
import { useRouter, useRouterState } from '@tanstack/react-router'
import { Image } from 'antd'
import {
    EllipsisIcon,
    FileTextIcon,
    HashIcon,
    LightbulbIcon,
    MegaphoneIcon,
    MessageSquareIcon,
    PlusIcon,
    SearchIcon,
} from 'lucide-react'
import { useState } from 'react'

import { INTERNAL_URLS, optimizeCloudinary } from '../../../../lib'
import { TCommunity } from '../../../types'
import { HeroButton } from '../../ui/hero-button'
import { CreateCommunityModal } from '../../../../features/communities/components/modals/CreateCommunityModal'
import { CreateTopicModal } from '../../../../features/communities/components/CreateTopicModal'

export const COMMUNITIES = [
    {
        id: 'c-sales',
        name: 'CSD- Sales & Marketing',
        color: 'bg-pink-600',
        icon: 'S',
        banner: 'https://img.freepik.com/free-vector/abstract-technology-background_23-2148395279.jpg',
        channels: [
            {
                id: 'ch-1',
                name: 'Official Notices',
                icon: MegaphoneIcon,
                type: 'announcement',
            },
            {
                id: 'ch-2',
                name: 'General Chat',
                icon: HashIcon,
                type: 'general',
            },
            {
                id: 'ch-3',
                name: 'Kaizen Ideas',
                icon: LightbulbIcon,
                type: 'idea',
            },
            {
                id: 'ch-4',
                name: 'IT Support',
                icon: MessageSquareIcon,
                type: 'support',
            },
        ],
    },
    {
        id: 'c-eng',
        name: 'CSD- Engineering Dept',
        color: 'bg-orange-600',
        icon: 'E',
        banner: 'https://img.freepik.com/free-photo/industrial-design-software-3d-rendering_110488-500.jpg',
        channels: [
            {
                id: 'ch-5',
                name: 'Blueprints',
                icon: FileTextIcon,
                type: 'files',
            },
            {
                id: 'ch-6',
                name: 'RnD Discussion',
                icon: HashIcon,
                type: 'general',
            },
        ],
    },
]
export default function CommunitiesSidebar({
    communities,
}: {
    communities: TCommunity[]
}) {
    const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
        null
    )
    const createCommunityModalDisclosure = useDisclosure({
        id: 'createCommunityModalDisclosure',
    })

    const createTopicModalDisclosure = useDisclosure({
        id: 'createTopicModalDisclosure',
    })

    const handleOpenTopicModal = (communityId: string) => {
        setSelectedCommunity(communityId)
        createTopicModalDisclosure.onOpen()
    }

    return (
        <div className="w-96 h-[calc(100vh-57px)] shrink-0 flex flex-col bg-background">
            {createCommunityModalDisclosure.isOpen && (
                <CreateCommunityModal
                    isOpen={createCommunityModalDisclosure.isOpen}
                    onClose={createCommunityModalDisclosure.onClose}
                />
            )}
            {createTopicModalDisclosure.isOpen && selectedCommunity && (
                <CreateTopicModal
                    isOpen={createTopicModalDisclosure.isOpen}
                    onClose={createTopicModalDisclosure.onClose}
                    communityId={selectedCommunity}
                    onSubmit={async () => {}}
                />
            )}
            <div className="p-4 flex items-center justify-between border-b border-border-default">
                <div />
                <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light">
                        <SearchIcon size={18} />
                    </Button>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={createCommunityModalDisclosure.onOpen}
                    >
                        <PlusIcon size={18} />
                    </Button>
                </div>
            </div>
            <ScrollShadow className="flex-1 pt-3 pb-4 px-3">
                {communities.map((community, idx) => (
                    <>
                        <CommunitySection
                            community={community}
                            key={community.id}
                            onOpenTopicModal={handleOpenTopicModal}
                        />
                        {idx !== communities.length - 1 && (
                            <Divider className="my-2 bg-border-default" />
                        )}
                    </>
                ))}
            </ScrollShadow>
        </div>
    )
}

function CommunitySection({
    community,
    onOpenTopicModal,
}: {
    community: TCommunity
    onOpenTopicModal: (communityId: string) => void
}) {
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    })
    const router = useRouter()

    return (
        <>
            <Button
                variant={
                    pathname.split('/').at(pathname.split('/').length - 1) ===
                    community.code
                        ? 'solid'
                        : 'light'
                }
                disableAnimation
                className="w-full h-17.5 flex items-center justify-between group"
                onPress={() =>
                    router.navigate({
                        href: INTERNAL_URLS.getCommunityUrl(community.code),
                    })
                }
            >
                <div className="flex items-center gap-3">
                    <Image
                        src={optimizeCloudinary(community.icon, {
                            width: 256,
                            height: 256,
                        })}
                        rootClassName="size-10! rounded-md"
                        className="size-full rounded-md"
                        preview={false}
                    />
                    <span className="font-semibold text-text-default text-sm uppercase tracking-wider">
                        {community.displayName}
                    </span>
                </div>
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <HeroButton
                            color="default"
                            size="xs"
                            className="size-4! p-0! flex transition duration-150"
                            isIconOnly
                            variant="light"
                        >
                            <EllipsisIcon size={14} />
                        </HeroButton>
                    </DropdownTrigger>
                    <DropdownMenu>
                        <DropdownItem
                            key="create_topic"
                            onPress={() => {
                                onOpenTopicModal(community.id)
                            }}
                        >
                            Create Topic
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </Button>
            <div className="mt-3 flex flex-col gap-0.5">
                {community.topics.map((topic) => {
                    const isActive = pathname.includes(topic.code)
                    return (
                        <Button
                            key={topic.id}
                            variant={isActive ? 'solid' : 'light'}
                            startContent={
                                <Image
                                    src={optimizeCloudinary(topic.icon ?? '', {
                                        width: 256,
                                        height: 256,
                                    })}
                                />
                            }
                            disableAnimation
                            onPress={() =>
                                router.navigate({
                                    href: INTERNAL_URLS.getCommunityTopicUrl(
                                        community.code,
                                        topic.code
                                    ),
                                })
                            }
                            className="w-full flex items-center justify-start gap-2 px-6 py-2 text-sm"
                        >
                            {topic.title}
                        </Button>
                    )
                })}
            </div>
        </>
    )
}
