import { Avatar, useDisclosure } from '@heroui/react'
import { UserRoundPlus } from 'lucide-react'

import { optimizeCloudinary } from '@/lib/cloudinary'
import { useProfile } from '@/lib/queries'

import AssignMemberModal from '../../../project-center/components/modals/AssignMemberModal'
import { HeroButton } from '../../../../shared/components/ui/hero-button'
import { HeroCard, HeroCardBody, HeroCardHeader } from '../../../../shared/components/ui/hero-card'
import { HeroChip } from '../../../../shared/components/ui/hero-chip'
import { HeroTooltip } from '../../../../shared/components/ui/hero-tooltip'
import { TJob } from '../../../../shared/types'

type JobAssigneesViewProps = { data: TJob }
export default function JobAssigneesView({ data }: JobAssigneesViewProps) {
    const { isAdmin } = useProfile()

    const { isOpen, onClose, onOpen } = useDisclosure({
        id: 'AssignMemberModal',
    })

    return (
        <>
            {isOpen && data.no && (
                <AssignMemberModal
                    jobNo={data.no}
                    onClose={onClose}
                    isOpen={isOpen}
                />
            )}
            <HeroCard className="bg-background-muted px-0! overflow-hidden border-none shadow-none">
                <HeroCardHeader className="justify-between py-1 text-text-8">
                    <span className="font-semibold text-xs tracking-wide text-text-default">
                        Assignees ({data.assignments.length})
                    </span>
                    {isAdmin && (
                        <HeroTooltip content="Assign / Reassign">
                            <HeroButton
                                isIconOnly
                                className="size-8.5! aspect-square!"
                                variant="light"
                                onPress={onOpen}
                            >
                                <UserRoundPlus
                                    size={14}
                                    className="text-text-subdued"
                                />
                            </HeroButton>
                        </HeroTooltip>
                    )}
                </HeroCardHeader>
                <HeroCardBody className="py-0! px-3 text-sm gap-6">
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-3">
                        {data.assignments?.map((ass, idx) => (
                            <HeroChip
                                key={idx}
                                avatar={
                                    <Avatar
                                        name={ass.user.displayName}
                                        src={optimizeCloudinary(
                                            ass.user.avatar
                                        )}
                                    />
                                }
                                variant="bordered"
                                className='border-1'
                            >
                                {ass.user.displayName}
                            </HeroChip>
                        ))}
                        <div className="flex flex-col items-center w-full">
                            {data.assignments.length === 0 && (
                                <p className="text-text-subdued text-xs whitespace-pre-line leading-relaxed text-center">
                                    No assignees yet.
                                </p>
                            )}
                            {data.assignments.length === 0 && isAdmin && (
                                <button
                                    className="text-text-subdued text-xs underline underline-offset-2 hover:text-text-default cursor-pointer w-fit"
                                    onClick={onOpen}
                                >
                                    Assign anyone
                                </button>
                            )}
                        </div>
                    </div>
                </HeroCardBody>
            </HeroCard>
        </>
    )
}
