import { resolvePathOptions } from '@/lib'
import {
    Button,
    Card,
    CardBody,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Snippet,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import {
    AlertCircle,
    ArrowRight,
    ExternalLink,
    FolderCheck,
    Hash,
    Search,
} from 'lucide-react'
import { useState } from 'react'

interface ResolvePathModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onResolved: (folderId: string) => void
    initialPath?: string
}

export function ResolvePathModal({
    isOpen,
    onOpenChange,
    onResolved,
    initialPath = '',
}: ResolvePathModalProps) {
    const [path, setPath] = useState(initialPath)

    const {
        data: folderData,
        refetch: resolvePath,
        isFetching,
        isError,
    } = useQuery({
        ...resolvePathOptions(path),
        enabled: false,
        retry: false,
    })

    const handleConfirm = () => {
        if (folderData?.id) {
            onResolved(folderData.id)
            onOpenChange(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary">
                                <Search size={20} />
                                <span>SharePoint Path Resolver</span>
                            </div>
                        </ModalHeader>
                        <ModalBody className="pb-8">
                            <p className="text-xs text-default-500 mb-4">
                                Enter the SharePoint relative path (e.g., \CSD-
                                TEAM\PROJECT CENTER) to resolve its unique
                                System ID.
                            </p>

                            <div className="flex gap-2 items-end">
                                <Input
                                    label="Folder Path"
                                    placeholder="Enter path..."
                                    labelPlacement="outside"
                                    variant="bordered"
                                    value={path}
                                    onChange={(e) => setPath(e.target.value)}
                                    className="flex-1"
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && resolvePath()
                                    }
                                />
                                <Button
                                    color="primary"
                                    isLoading={isFetching}
                                    onPress={() => resolvePath()}
                                    className="font-bold"
                                >
                                    Resolve
                                </Button>
                            </div>

                            <div className="mt-6 min-h-30 relative">
                                {folderData ? (
                                    <div className="animate-in fade-in duration-300 space-y-4">
                                        <Card
                                            shadow="none"
                                            className="border border-success-200 bg-success-50/10"
                                        >
                                            <CardBody className="p-4">
                                                {/* Folder Header */}
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-success-100 text-success-600 rounded-xl">
                                                        <FolderCheck
                                                            size={24}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-success-900 truncate">
                                                                {
                                                                    folderData.name
                                                                }
                                                            </span>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() =>
                                                                    window.open(
                                                                        folderData.webUrl,
                                                                        '_blank'
                                                                    )
                                                                }
                                                            >
                                                                <ExternalLink
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </div>
                                                        <p className="text-[10px] text-success-600 truncate font-mono mt-0.5">
                                                            {
                                                                folderData.displayPath
                                                            }
                                                        </p>
                                                    </div>
                                                </div>

                                                <Divider className="my-3 bg-success-200/40" />

                                                {/* ID Section with Quick Copy */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[10px] uppercase font-bold text-default-400 flex items-center gap-1">
                                                            <Hash size={10} />{' '}
                                                            Unique System ID
                                                        </span>
                                                        <span className="text-[10px] text-success-600 font-bold uppercase">
                                                            Valid Folder
                                                        </span>
                                                    </div>

                                                    <Snippet
                                                        symbol=""
                                                        variant="bordered"
                                                        color="primary"
                                                        classNames={{
                                                            base: 'w-full bg-white dark:bg-default-50 border-default-200',
                                                            pre: 'font-mono font-bold text-xs truncate flex-1',
                                                            copyButton:
                                                                'text-primary',
                                                        }}
                                                    >
                                                        {folderData.id}
                                                    </Snippet>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-4 mt-4 px-1">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-default-400 font-bold uppercase tracking-tighter">
                                                            Contents
                                                        </span>
                                                        <span className="text-sm font-semibold text-default-700">
                                                            {
                                                                folderData.childCount
                                                            }{' '}
                                                            Items
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-default-400 font-bold uppercase tracking-tighter">
                                                            Storage Size
                                                        </span>
                                                        <span className="text-sm font-semibold text-default-700">
                                                            {
                                                                folderData.sizeInMB
                                                            }{' '}
                                                            MB
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                ) : isError ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-danger animate-in shake-1 border-2 border-dashed border-danger-100 rounded-xl">
                                        <AlertCircle size={32} />
                                        <p className="text-sm font-bold mt-2">
                                            Resolution Failed
                                        </p>
                                        <p className="text-[11px] opacity-70">
                                            Check path format or permissions.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-default-100 rounded-xl bg-default-50/20">
                                        <Search
                                            size={32}
                                            className="text-default-200"
                                        />
                                        <p className="text-sm text-default-400 mt-2 italic">
                                            Search results will appear here
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter className="border-t border-default-100">
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="font-semibold"
                            >
                                Close
                            </Button>
                            <Button
                                color="primary"
                                isDisabled={!folderData?.id}
                                onPress={handleConfirm}
                                endContent={<ArrowRight size={16} />}
                                className="font-bold shadow-md"
                            >
                                Apply ID to Form
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
