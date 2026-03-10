import { Select, SelectItem, useDisclosure } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Folder, Plus } from 'lucide-react'
import { useState } from 'react'
import {
    SHAREPOINT,
    sharepointFolderItemsOptions,
    TCreateJobFolderTemplateInput,
} from '../../../../lib'
import {
    HeroButton,
    HeroInput,
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components'
import CancelModal from '../../../../shared/components/ui/cancel-modal'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    editingTemplate?: any
    onSave: (data: TCreateJobFolderTemplateInput) => void
}

export function CreateFolderTemplateModal({
    isOpen,
    onClose,
    editingTemplate,
    onSave,
}: ModalProps) {
    const {
        data: { items },
    } = useSuspenseQuery(
        sharepointFolderItemsOptions(SHAREPOINT.JOB_FOLDER_TEMPLATE_ID)
    )
    const [displayName, setDisplayName] = useState('')
    const [selectedFolderId, setSelectedFolderId] = useState<string>('')

    const cancelModalDisclosure = useDisclosure()

    // Reset or set state when modal opens
    useState(() => {
        if (editingTemplate) {
            setDisplayName(editingTemplate.displayName)
            setSelectedFolderId(editingTemplate.folderId)
        } else {
            setDisplayName('')
            setSelectedFolderId('')
        }
    })

    const handleSave = () => {
        if (!displayName || !selectedFolderId) return

        const folder = items?.find((f) => f.id === selectedFolderId)
        onSave({
            displayName,
            folderId: selectedFolderId,
            folderName: folder?.name ?? 'Unknown folder',
            size: folder?.size,
            webUrl: folder.url || folder.webUrl,
        })
    }

    return (
        <>
            <CancelModal
                isOpen={cancelModalDisclosure.isOpen}
                onClose={cancelModalDisclosure.onClose}
                onConfirm={onClose}
                title="Cancel Folder Template Creation"
                message="Are you sure you do not want to create ?"
            />
            <HeroModal
                isOpen={isOpen}
                onClose={cancelModalDisclosure.onOpen}
                size="md"
            >
                <HeroModalContent>
                    <HeroModalHeader className="flex flex-col gap-1 text-[#1B365D]">
                        {editingTemplate
                            ? 'Edit Folder Template'
                            : 'Create New Job Folder Template'}
                    </HeroModalHeader>
                    <HeroModalBody className="space-y-4">
                        <HeroInput
                            label="Template Display Name"
                            placeholder="e.g. Project CAD Models"
                            labelPlacement="outside"
                            value={displayName}
                            onValueChange={setDisplayName}
                            variant="bordered"
                            isRequired
                        />

                        <Select
                            label="SharePoint Folder Source"
                            placeholder="Choose folder from SharePoint"
                            labelPlacement="outside"
                            variant="bordered"
                            selectedKeys={
                                selectedFolderId ? [selectedFolderId] : []
                            }
                            onChange={(e) =>
                                setSelectedFolderId(e.target.value)
                            }
                            isRequired
                        >
                            {items
                                ? items
                                      .filter((it) => it.isFolder)
                                      ?.map((folder) => (
                                          <SelectItem
                                              key={folder.id}
                                              textValue={folder.name}
                                              startContent={
                                                  <Folder size={16} />
                                              }
                                          >
                                              {folder.name}
                                          </SelectItem>
                                      ))
                                : null}
                        </Select>

                        <div className="bg-blue-50 p-3 rounded-lg flex gap-3 mt-2">
                            <Plus
                                size={20}
                                className="text-[#1B365D] shrink-0"
                            />
                            <p className="text-xs text-slate-600 italic">
                                Linking a template ensures that when a new job
                                is created, this folder structure will be
                                automatically provisioned in SharePoint.
                            </p>
                        </div>
                    </HeroModalBody>
                    <HeroModalFooter>
                        <HeroButton variant="flat" onPress={onClose}>
                            Cancel
                        </HeroButton>
                        <HeroButton
                            className="bg-[#F37021] text-white font-bold"
                            onPress={handleSave}
                            isDisabled={!displayName || !selectedFolderId}
                        >
                            {editingTemplate
                                ? 'Update Template'
                                : 'Create Template'}
                        </HeroButton>
                    </HeroModalFooter>
                </HeroModalContent>
            </HeroModal>
        </>
    )
}
