import {
    Avatar,
    Badge,
    Button,
    Card,
    CardBody,
    ScrollShadow,
} from '@heroui/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

// --- TYPES ---
interface OrgUser {
    id: string
    name: string
    role: string
    avatar: string
    status: 'online' | 'offline' | 'busy'
}

// --- EXTENDED MOCK DATA ---
const MANAGERS: OrgUser[] = [
    {
        id: 'm-1',
        name: 'Olivier Hanne',
        role: 'President',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
        status: 'busy',
    },
    {
        id: 'm-2',
        name: 'Laurent Yvart',
        role: 'Director General',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        status: 'online',
    },
]

const CURRENT_USER: OrgUser = {
    id: 'u-current',
    name: 'Rudy Dugue',
    role: 'Head of Sales VN',
    avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d',
    status: 'online',
}

// 12 items to demonstrate pagination
const DIRECT_REPORTS: OrgUser[] = [
    {
        id: 'dr-1',
        name: 'Yvan Pham',
        role: 'Designer',
        avatar: 'https://i.pravatar.cc/150?u=10',
        status: 'offline',
    },
    {
        id: 'dr-2',
        name: 'Trang Le',
        role: 'Designer',
        avatar: 'https://i.pravatar.cc/150?u=11',
        status: 'online',
    },
    {
        id: 'dr-3',
        name: 'Thuc TRUONG',
        role: 'Developer',
        avatar: 'https://i.pravatar.cc/150?u=12',
        status: 'busy',
    },
    {
        id: 'dr-4',
        name: 'Ivan Dang',
        role: 'Designer',
        avatar: 'https://i.pravatar.cc/150?u=13',
        status: 'online',
    },
    {
        id: 'dr-5',
        name: 'Minh Nguyen',
        role: 'QA Engineer',
        avatar: 'https://i.pravatar.cc/150?u=14',
        status: 'online',
    },
    {
        id: 'dr-6',
        name: 'Sarah Connor',
        role: 'Security',
        avatar: 'https://i.pravatar.cc/150?u=15',
        status: 'busy',
    },
    {
        id: 'dr-7',
        name: 'John Doe',
        role: 'Intern',
        avatar: 'https://i.pravatar.cc/150?u=16',
        status: 'offline',
    },
    {
        id: 'dr-8',
        name: 'Jane Smith',
        role: 'Marketing',
        avatar: 'https://i.pravatar.cc/150?u=17',
        status: 'online',
    },
    {
        id: 'dr-9',
        name: 'Alex T',
        role: 'DevOps',
        avatar: 'https://i.pravatar.cc/150?u=18',
        status: 'online',
    },
    {
        id: 'dr-10',
        name: 'Chris Evans',
        role: 'Actor',
        avatar: 'https://i.pravatar.cc/150?u=19',
        status: 'busy',
    },
    {
        id: 'dr-11',
        name: 'Tony Stark',
        role: 'Engineer',
        avatar: 'https://i.pravatar.cc/150?u=20',
        status: 'online',
    },
    {
        id: 'dr-12',
        name: 'Bruce Banner',
        role: 'Researcher',
        avatar: 'https://i.pravatar.cc/150?u=21',
        status: 'offline',
    },
]

// --- HELPER COMPONENTS ---

const getStatusColor = (status: string) => {
    switch (status) {
        case 'online':
            return 'success'
        case 'busy':
            return 'danger'
        default:
            return 'default'
    }
}

const OrgCard = ({
    user,
    isActive = false,
}: {
    user: OrgUser
    isActive?: boolean
}) => (
    <Card
        className={`w-50 shrink-0 border transition-all hover:scale-105 hover:shadow-lg ${
            isActive
                ? 'border-primary border-2 shadow-md z-10'
                : 'border-default-200'
        }`}
    >
        <CardBody className="flex flex-col items-center gap-2 p-3 text-center">
            <Badge
                content=""
                color={getStatusColor(user.status)}
                shape="circle"
                placement="bottom-right"
                size="sm"
                className="border-2 border-background"
            >
                <Avatar
                    src={user.avatar}
                    size="lg"
                    isBordered={isActive}
                    color={isActive ? 'primary' : 'default'}
                />
            </Badge>
            <div className="flex flex-col overflow-hidden w-full">
                <span
                    className={`font-semibold text-small truncate ${isActive ? 'text-primary' : ''}`}
                >
                    {user.name}
                </span>
                <span className="text-tiny text-default-500 truncate">
                    {user.role}
                </span>
            </div>
        </CardBody>
    </Card>
)

const VerticalLine = ({ height = 'h-8' }: { height?: string }) => (
    <div className={`w-px ${height} bg-default-300 mx-auto`}></div>
)

export default function ProfileOrganization() {
    const [isExpanded, setIsExpanded] = useState(false)

    // Configuration
    const INITIAL_LIMIT = 4
    const totalReports = DIRECT_REPORTS.length

    // Slice data based on state
    const visibleReports = isExpanded
        ? DIRECT_REPORTS
        : DIRECT_REPORTS.slice(0, INITIAL_LIMIT)

    const hiddenCount = totalReports - visibleReports.length

    return (
        <div className="w-full py-3 flex flex-col items-center">
            {/* SCROLL CONTAINER */}
            <ScrollShadow orientation="horizontal" className="w-full pb-24">
                <div className="flex flex-col items-center min-w-fit px-8">
                    {/* --- LEVEL 1: ANCESTORS --- */}
                    {MANAGERS.map((manager) => (
                        <div
                            key={manager.id}
                            className="flex flex-col items-center"
                        >
                            <OrgCard user={manager} />
                            <VerticalLine />
                        </div>
                    ))}

                    {/* --- LEVEL 2: CURRENT USER --- */}
                    <div className="flex flex-col items-center group">
                        <OrgCard user={CURRENT_USER} isActive />

                        <div className="flex flex-col items-center">
                            <VerticalLine height="h-6" />
                            {/* Horizontal Connector Bar */}
                            {visibleReports.length > 0 && (
                                <div className="relative h-4 w-full">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-200px)] h-px bg-default-300"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- LEVEL 3: CHILDREN --- */}
                    <div className="flex justify-center gap-8 pt-2 transition-all">
                        {visibleReports.map((report, index) => {
                            const isFirst = index === 0
                            const isLast = index === visibleReports.length - 1
                            const isOnly = visibleReports.length === 1

                            return (
                                <div
                                    key={report.id}
                                    className="flex flex-col items-center relative animate-appearance-in"
                                >
                                    {/* Tree Connector Lines */}
                                    <div className="w-full h-6 absolute -top-6 flex">
                                        <div
                                            className={`w-1/2 h-full ${
                                                isFirst || isOnly
                                                    ? ''
                                                    : 'border-t border-default-300'
                                            }`}
                                        ></div>
                                        <div
                                            className={`w-1/2 h-full ${
                                                isLast || isOnly
                                                    ? ''
                                                    : 'border-t border-default-300 l-0'
                                            } border-l border-default-300`}
                                        ></div>
                                    </div>

                                    <OrgCard user={report} />
                                </div>
                            )
                        })}
                    </div>

                    {/* --- EXPAND / COLLAPSE BUTTON --- */}
                    {totalReports > INITIAL_LIMIT && (
                        <div className="mt-12 relative">
                            {/* Small connector line to the button itself */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-linear-to-b from-default-300 to-transparent"></div>

                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                onPress={() => setIsExpanded(!isExpanded)}
                                startContent={
                                    isExpanded ? (
                                        <ChevronUp size={16} />
                                    ) : (
                                        <ChevronDown size={16} />
                                    )
                                }
                                className="font-medium"
                            >
                                {isExpanded
                                    ? 'Collapse List'
                                    : `View ${hiddenCount} more employees`}
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollShadow>
        </div>
    )
}
