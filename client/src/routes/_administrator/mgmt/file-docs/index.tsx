import {
    Avatar,
    BreadcrumbItem,
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Progress,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import {
    Clock,
    Cloud,
    Download,
    File,
    FileText,
    Film,
    Folder,
    Grid,
    HardDrive,
    Image as ImageIcon,
    List as ListIcon,
    MoreVertical,
    Plus,
    Search,
    Share2,
    Trash2,
    UploadCloud,
} from 'lucide-react'
import { useState } from 'react'

import { getPageTitle } from '../../../../lib'

export const Route = createFileRoute('/_administrator/mgmt/file-docs/')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('File & Docs'),
            },
        ],
    }),
    component: FileManagerPage,
})

interface FileItem {
    id: string
    name: string
    type: 'FOLDER' | 'IMAGE' | 'PDF' | 'DOC' | 'VIDEO' | 'XLS'
    size?: string // e.g., "2.4 MB"
    items?: number // Only for folders
    updatedAt: string
    owner: { name: string; avatar: string }
    provider?: 'LOCAL' | 'SHAREPOINT' | 'AZURE' // For future integration
}

// --- Mock Data ---
const FOLDERS: FileItem[] = [
    {
        id: 'f1',
        name: 'Design Assets',
        type: 'FOLDER',
        items: 24,
        size: '120 MB',
        updatedAt: '2 days ago',
        owner: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        provider: 'SHAREPOINT',
    },
    {
        id: 'f2',
        name: 'Financials 2024',
        type: 'FOLDER',
        items: 8,
        size: '15 MB',
        updatedAt: '1 week ago',
        owner: { name: 'Amanda', avatar: 'https://i.pravatar.cc/150?u=amanda' },
        provider: 'AZURE',
    },
    {
        id: 'f3',
        name: 'Client Contracts',
        type: 'FOLDER',
        items: 56,
        size: '450 MB',
        updatedAt: 'Yesterday',
        owner: { name: 'James', avatar: 'https://i.pravatar.cc/150?u=james' },
        provider: 'SHAREPOINT',
    },
    {
        id: 'f4',
        name: 'Marketing',
        type: 'FOLDER',
        items: 12,
        size: '85 MB',
        updatedAt: '3 days ago',
        owner: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
        provider: 'LOCAL',
    },
]

const RECENT_FILES: FileItem[] = [
    {
        id: '1',
        name: 'Project_Requirements.pdf',
        type: 'PDF',
        size: '2.4 MB',
        updatedAt: '2 hours ago',
        owner: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        provider: 'SHAREPOINT',
    },
    {
        id: '2',
        name: 'Homepage_v2.png',
        type: 'IMAGE',
        size: '4.1 MB',
        updatedAt: '5 hours ago',
        owner: { name: 'David', avatar: 'https://i.pravatar.cc/150?u=david' },
        provider: 'LOCAL',
    },
    {
        id: '3',
        name: 'Budget_Q1.xlsx',
        type: 'XLS',
        size: '1.2 MB',
        updatedAt: 'Yesterday',
        owner: { name: 'Amanda', avatar: 'https://i.pravatar.cc/150?u=amanda' },
        provider: 'AZURE',
    },
    {
        id: '4',
        name: 'Demo_Walkthrough.mp4',
        type: 'VIDEO',
        size: '45 MB',
        updatedAt: '2 days ago',
        owner: { name: 'James', avatar: 'https://i.pravatar.cc/150?u=james' },
        provider: 'SHAREPOINT',
    },
    {
        id: '5',
        name: 'Meeting_Notes.docx',
        type: 'DOC',
        size: '15 KB',
        updatedAt: '3 days ago',
        owner: { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        provider: 'SHAREPOINT',
    },
]

// --- Helper Functions ---
const getFileIcon = (type: string) => {
    switch (type) {
        case 'FOLDER':
            return (
                <Folder className="text-yellow-500 fill-yellow-500" size={32} />
            )
        case 'PDF':
            return <FileText className="text-red-500" size={24} />
        case 'IMAGE':
            return <ImageIcon className="text-blue-500" size={24} />
        case 'VIDEO':
            return <Film className="text-purple-500" size={24} />
        case 'XLS':
            return <FileText className="text-green-600" size={24} />
        default:
            return <File className="text-slate-400" size={24} />
    }
}

const getProviderIcon = (provider?: string) => {
    if (provider === 'SHAREPOINT')
        return <Cloud size={14} className="text-blue-600" />
    if (provider === 'AZURE')
        return <HardDrive size={14} className="text-blue-400" />
    return null
}

function FileManagerPage() {
    const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* --- SIDEBAR --- */}
            <div className="w-64 bg-white border-r border-slate-200 flex-col p-6 hidden lg:flex">
                <Button
                    color="primary"
                    className="w-full mb-8 font-medium shadow-lg shadow-blue-500/20"
                    startContent={<UploadCloud size={20} />}
                >
                    Upload New File
                </Button>

                <div className="space-y-1 mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                        Storage
                    </p>
                    <Button
                        variant="light"
                        className="w-full justify-start text-slate-600"
                        startContent={<HardDrive size={18} />}
                    >
                        My Drive
                    </Button>
                    <Button
                        variant="light"
                        className="w-full justify-start text-slate-600"
                        startContent={<Share2 size={18} />}
                    >
                        Shared with me
                    </Button>
                    <Button
                        variant="light"
                        className="w-full justify-start text-slate-600"
                        startContent={<Clock size={18} />}
                    >
                        Recent
                    </Button>
                    <Button
                        variant="light"
                        className="w-full justify-start text-slate-600"
                        startContent={<Trash2 size={18} />}
                    >
                        Trash
                    </Button>
                </div>

                <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-border-default">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-700">
                            Storage Used
                        </span>
                        <span className="text-xs text-slate-500">75%</span>
                    </div>
                    <Progress
                        value={75}
                        color="warning"
                        size="sm"
                        className="mb-2"
                    />
                    <p className="text-xs text-slate-400">
                        7.5 GB of 10 GB used
                    </p>
                    <Button
                        size="sm"
                        variant="bordered"
                        className="w-full mt-3 border-slate-300"
                    >
                        Upgrade Plan
                    </Button>
                </div>
            </div>
            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Toolbar */}
                <div className="h-20 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <Breadcrumbs size="lg" separator="/">
                            <BreadcrumbItem>My Drive</BreadcrumbItem>
                            <BreadcrumbItem>Projects</BreadcrumbItem>
                            <BreadcrumbItem
                                isCurrent
                                className="font-bold text-slate-900"
                            >
                                Assets
                            </BreadcrumbItem>
                        </Breadcrumbs>
                    </div>

                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search files..."
                            startContent={
                                <Search size={18} className="text-slate-400" />
                            }
                            className="w-64"
                            size="sm"
                            radius="lg"
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <div className="bg-slate-100 rounded-lg p-1 flex">
                            <Button
                                isIconOnly
                                size="sm"
                                variant={
                                    viewMode === 'GRID' ? 'solid' : 'light'
                                }
                                className={
                                    viewMode === 'GRID'
                                        ? 'bg-white shadow-sm'
                                        : ''
                                }
                                onPress={() => setViewMode('GRID')}
                            >
                                <Grid size={18} />
                            </Button>
                            <Button
                                isIconOnly
                                size="sm"
                                variant={
                                    viewMode === 'LIST' ? 'solid' : 'light'
                                }
                                className={
                                    viewMode === 'LIST'
                                        ? 'bg-white shadow-sm'
                                        : ''
                                }
                                onPress={() => setViewMode('LIST')}
                            >
                                <ListIcon size={18} />
                            </Button>
                        </div>
                        <Button isIconOnly variant="light" size="sm">
                            <MoreVertical
                                size={20}
                                className="text-slate-500"
                            />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Folders Section */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">
                            Folders
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {FOLDERS.map((folder) => (
                                <Card
                                    key={folder.id}
                                    isPressable
                                    shadow="sm"
                                    className="border border-border-default hover:border-blue-200 bg-white"
                                >
                                    <CardBody className="flex flex-row items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(folder.type)}
                                            <div className="text-left">
                                                <p className="font-medium text-slate-800 text-sm truncate max-w-[120px]">
                                                    {folder.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {folder.items} items •{' '}
                                                    {folder.size}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Cloud Indicator */}
                                        {folder.provider !== 'LOCAL' && (
                                            <div
                                                title={`Synced with ${folder.provider}`}
                                                className="bg-blue-50 p-1.5 rounded-full"
                                            >
                                                {getProviderIcon(
                                                    folder.provider
                                                )}
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}

                            {/* Add Folder Button */}
                            <button className="border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all h-[80px]">
                                <Plus size={20} />
                                Create Folder
                            </button>
                        </div>
                    </div>

                    {/* Recent Files Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-800">
                                Recent Files
                            </h3>
                            <Button size="sm" variant="light" color="primary">
                                View All
                            </Button>
                        </div>

                        {viewMode === 'LIST' ? (
                            <Card className="w-full" shadow="sm">
                                <Table
                                    aria-label="Files table"
                                    shadow="none"
                                    removeWrapper
                                >
                                    <TableHeader>
                                        <TableColumn>NAME</TableColumn>
                                        <TableColumn>OWNER</TableColumn>
                                        <TableColumn>SIZE</TableColumn>
                                        <TableColumn>UPDATED</TableColumn>
                                        <TableColumn align="end">
                                            ACTIONS
                                        </TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {RECENT_FILES.map((file) => (
                                            <TableRow
                                                key={file.id}
                                                className="cursor-pointer hover:bg-slate-50"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-slate-50 rounded-lg">
                                                            {getFileIcon(
                                                                file.type
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-700">
                                                                {file.name}
                                                            </p>
                                                            {file.provider !==
                                                                'LOCAL' && (
                                                                <div className="flex items-center gap-1 text-[10px] text-blue-500">
                                                                    {getProviderIcon(
                                                                        file.provider
                                                                    )}
                                                                    <span>
                                                                        Synced
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar
                                                            src={
                                                                file.owner
                                                                    .avatar
                                                            }
                                                            size="sm"
                                                        />
                                                        <span className="text-sm text-slate-600">
                                                            {file.owner.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-500 text-sm">
                                                        {file.size}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-slate-500 text-sm">
                                                        {file.updatedAt}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                        >
                                                            <Download
                                                                size={16}
                                                            />
                                                        </Button>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                        >
                                                            <MoreVertical
                                                                size={16}
                                                            />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        ) : (
                            // GRID VIEW
                            (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                                {RECENT_FILES.map((file) => (
                                    <Card
                                        key={file.id}
                                        isPressable
                                        shadow="sm"
                                        className="group"
                                    >
                                        <CardBody className="p-0 overflow-hidden relative">
                                            {/* Preview Placeholder */}
                                            <div className="h-32 bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                                {getFileIcon(file.type)}
                                            </div>

                                            {/* Cloud Badge */}
                                            {file.provider !== 'LOCAL' && (
                                                <div className="absolute top-2 right-2 bg-white/80 backdrop-blur p-1 rounded-md shadow-sm">
                                                    {getProviderIcon(
                                                        file.provider
                                                    )}
                                                </div>
                                            )}

                                            <div className="p-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p
                                                        className="font-medium text-slate-700 text-sm truncate pr-2 flex-1"
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <button className="text-slate-400 hover:text-slate-600">
                                                                <MoreVertical
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </DropdownTrigger>
                                                        <DropdownMenu aria-label="Actions">
                                                            <DropdownItem
                                                                key="download"
                                                                startContent={
                                                                    <Download
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                Download
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="share"
                                                                startContent={
                                                                    <Share2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                Share
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                key="delete"
                                                                className="text-danger"
                                                                color="danger"
                                                                startContent={
                                                                    <Trash2
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </Dropdown>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-slate-400">
                                                        {file.size}
                                                    </span>
                                                    <Avatar
                                                        src={file.owner.avatar}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>)
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
