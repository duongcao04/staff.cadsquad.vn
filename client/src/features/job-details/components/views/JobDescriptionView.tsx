import {
    useProfile,
    useUpdateJobGeneralInfoMutation,
    useUpdateJobMutation,
} from '@/lib/queries'
import type { TJob } from '@/shared/types'
import { addToast, useDisclosure } from '@heroui/react'
import { Check, Maximize2, Pencil, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import QuillEditor from '../../../../shared/components/editor-quill/QuillEditor'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import { HeroCard, HeroCardBody, HeroCardHeader } from '../../../../shared/components/ui/hero-card'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'
import HtmlReactParser from '../../../../shared/components/ui/html-react-parser'
import JobDescriptionModal from '../modals/JobDescriptionModal'

type JobDescriptionViewProps = {
    data: TJob
}
export default function JobDescriptionView({ data }: JobDescriptionViewProps) {
    const { isAdmin } = useProfile()
    const [isEditable, setIsEditable] = useState(false)
    const [content, setContent] = useState(data?.description || '')

    const updateJobGeneralInfoMutation = useUpdateJobGeneralInfoMutation()

    // Controls the "Full View" Modal
    const fullViewDisclosure = useDisclosure()

    const updateJobMutation = useUpdateJobMutation(() => {
        addToast({
            title: 'Description updated',
            // description: `Job #${res.result?.no} updated successfully.`,
            color: 'success',
        })
        setIsEditable(false)
    })

    // Reset local state if the job prop changes externally
    useEffect(() => {
        setContent(data?.description || '')
    }, [data?.description])

    const onSave = async () => {
        if (!content || content === '<p><br></p>') {
            addToast({
                title: 'Description cannot be empty',
                color: 'danger',
            })
            return
        }

        await updateJobMutation.mutateAsync({
            jobId: data.id,
            data: { description: content },
        })
    }

    const handleSaveDescription = async (value: string) => {
        if (data) {
            await updateJobGeneralInfoMutation.mutateAsync({
                jobId: data.id,
                data: {
                    description: value,
                },
            })
        }
    }

    return (
        <>
            {/* 1. FULL VIEW MODAL */}
            <JobDescriptionModal
                isOpen={fullViewDisclosure.isOpen}
                onClose={fullViewDisclosure.onClose}
                defaultValue={content}
                onSave={handleSaveDescription}
                title={`Editing Description: #${data.no}`}
            />

            <HeroCard className="p-0!">
                <HeroCardHeader className="justify-between py-1 bg-background-muted">
                    <span className="text-small font-bold text-default-600 uppercase tracking-wider">
                        Description
                    </span>

                    {isAdmin && (
                        <div className="flex items-center gap-1">
                            {isEditable ? (
                                <div className="flex items-center gap-1">
                                    <HeroButton
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        onPress={() => {
                                            setIsEditable(false)
                                            setContent(data?.description || '') // Revert
                                        }}
                                    >
                                        <X size={16} className="text-danger" />
                                    </HeroButton>
                                    <HeroButton
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        isLoading={updateJobMutation.isPending}
                                        onPress={onSave}
                                    >
                                        <Check
                                            size={16}
                                            className="text-success"
                                        />
                                    </HeroButton>
                                </div>
                            ) : (
                                <>
                                    {/* Trigger Full View Modal */}
                                    <HeroTooltip content="Expand to Full View">
                                        <HeroButton
                                            isIconOnly
                                            className="size-8.5!"
                                            variant="light"
                                            onPress={fullViewDisclosure.onOpen}
                                        >
                                            <Maximize2
                                                size={14}
                                                className="text-text-subdued"
                                            />
                                        </HeroButton>
                                    </HeroTooltip>

                                    {/* Standard Inline Edit Toggle */}
                                    <HeroTooltip content="Inline Edit">
                                        <HeroButton
                                            isIconOnly
                                            className="size-8.5!"
                                            variant="light"
                                            onPress={() => setIsEditable(true)}
                                        >
                                            <Pencil
                                                size={14}
                                                className="text-text-subdued"
                                            />
                                        </HeroButton>
                                    </HeroTooltip>
                                </>
                            )}
                        </div>
                    )}
                </HeroCardHeader>

                <HeroCardBody className="p-0!">
                    {isEditable ? (
                        <div className="border-none">
                            <QuillEditor
                                value={content}
                                onChange={setContent}
                            />
                        </div>
                    ) : (
                        <div className="p-5 min-h-25">
                            {data?.description ? (
                                <HtmlReactParser
                                    htmlString={data?.description}
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 py-4">
                                    <p className="text-text-subdued text-sm text-center">
                                        No description provided.
                                    </p>
                                    {isAdmin && (
                                        <button
                                            className="text-primary text-sm underline underline-offset-4 hover:opacity-80"
                                            onClick={() => setIsEditable(true)}
                                        >
                                            Add project details
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </HeroCardBody>
            </HeroCard>
        </>
    )
}
