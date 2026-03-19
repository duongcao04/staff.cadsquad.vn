import {
    currencyFormatter,
    dateFormatter,
    INTERNAL_URLS,
    PAID_STATUS_COLOR,
    useProfile,
    useUpdateJobGeneralInfoMutation,
    useUpdateJobMutation,
} from '@/lib'
import {
    JobDetailTabEnum,
    Route,
    TJobDetailSearch,
} from '@/routes/_workspace/jobs/$no'
import {
    addToast,
    Avatar,
    Button,
    Chip,
    Divider,
    Spinner,
    Tab,
    Tabs,
    useDisclosure,
} from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    Clock,
    LibraryBig,
    Maximize2,
    MoreVertical,
    Share2,
    UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { jobActivityLogsOptions, jobByNoOptions } from '../../../../lib/queries'
import { JobStatusChip } from '../../../../shared/components/chips/JobStatusChip'
import JobAttachmentsField from '../../../../shared/components/form-fields/JobAttachmentsField'
import CountdownTimer from '../../../../shared/components/ui/countdown-timer'
import {
    HeroCard,
    HeroCardBody,
} from '../../../../shared/components/ui/hero-card'
import HtmlReactParser from '../../../../shared/components/ui/html-react-parser'
import { JobStatusSystemTypeEnum } from '../../../../shared/enums'
import { DeliverJobModal } from '../../../job-manage/components/modals/DeliverJobModal'
import UpdateCostModal from '../../../project-center/components/modals/UpdateCostModal'
import JobDescriptionModal from '../modals/JobDescriptionModal'
import { JobActivityHistory } from '../views/JobActivityHistory'
import JobAssigneesView from '../views/JobAssigneesView'
import JobCommentsView from '../views/JobCommentsView'

function MobileJobDetailPage() {
    const { no } = Route.useParams()
    const searchParams = Route.useSearch()
    const navigate = useNavigate()
    const { isAdmin } = useProfile()

    const deliverJobDisclosure = useDisclosure()
    const financialModal = useDisclosure()
    const fullEditorDisclosure = useDisclosure()

    const updateJobGeneralInfoMutation = useUpdateJobGeneralInfoMutation()

    const { data: job } = useQuery({ ...jobByNoOptions(no), enabled: !!no })
    const { data: activityLogs } = useQuery({
        ...jobActivityLogsOptions(job?.id ?? ''),
        enabled: !!job?.id,
    })

    const handleTabChange = (key: React.Key) => {
        navigate({
            search: ((prev: TJobDetailSearch) => ({
                ...prev,
                tab: key as JobDetailTabEnum,
            })) as unknown as true,
            replace: true,
        })
    }

    const updateJobMutation = useUpdateJobMutation(() =>
        addToast({ title: 'Success', color: 'success' })
    )

    const [descContent, setDescContent] = useState('')
    useEffect(() => {
        if (job?.description) setDescContent(job.description)
    }, [job?.description])

    const budgetUsage = useMemo(() => {
        if (!job?.incomeCost || job.incomeCost === 0) return 0
        return Math.min(
            Math.round(((job.totalStaffCost || 0) / job.incomeCost) * 100),
            100
        )
    }, [job])

    if (!job)
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        )

    const handleSaveDescription = async (value: string) => {
        if (job) {
            await updateJobGeneralInfoMutation.mutateAsync({
                jobId: job.id,
                data: {
                    description: value,
                },
            })
        }
    }

    const isJobActive = ![
        JobStatusSystemTypeEnum.COMPLETED,
        JobStatusSystemTypeEnum.TERMINATED,
        JobStatusSystemTypeEnum.DELIVERED,
    ].includes(job.status.systemType as any)

    return (
        <>
            {/* MODALS */}
            {deliverJobDisclosure.isOpen && (
                <DeliverJobModal
                    isOpen={deliverJobDisclosure.isOpen}
                    onClose={deliverJobDisclosure.onClose}
                    defaultJob={job}
                />
            )}
            {financialModal.isOpen && (
                <UpdateCostModal
                    jobNo={job.no}
                    isOpen={financialModal.isOpen}
                    onClose={financialModal.onClose}
                />
            )}
            {fullEditorDisclosure.isOpen && (
                <JobDescriptionModal
                    isOpen={fullEditorDisclosure.isOpen}
                    onClose={fullEditorDisclosure.onClose}
                    onSave={handleSaveDescription}
                    defaultValue={descContent}
                    title={`Editor: #${job.no}`}
                />
            )}

            {/* STICKY HEADER */}
            <div className="sticky top-0 z-50 bg-background-muted backdrop-blur-md border-b border-divider px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to={INTERNAL_URLS.projectCenter}>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            radius="full"
                        >
                            <ChevronLeft size={24} />
                        </Button>
                    </Link>
                    <span className="font-bold text-base line-clamp-1">
                        Job Details
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button isIconOnly variant="light" size="sm" radius="full">
                        <Share2 size={18} />
                    </Button>
                    <Button isIconOnly variant="light" size="sm" radius="full">
                        <MoreVertical size={18} />
                    </Button>
                </div>
            </div>

            <div className="p-4 space-y-5 pb-32">
                {/* TITLE & META SECTION */}
                <section className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="font-mono font-bold"
                        >
                            #{job.no}
                        </Chip>
                        <span className="text-xs font-medium text-warning-500 bg-warning-50 px-2 py-0.5 rounded-md">
                            {job.status?.displayName}
                        </span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-text-default leading-tight">
                        {job.displayName}
                    </h1>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                        <div className="flex items-center gap-1.5 text-xs text-text-subdued font-medium">
                            <UserRound size={14} />{' '}
                            {job.client?.name ?? 'Unknown client'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-text-subdued font-medium">
                            <LibraryBig size={14} /> {job.type?.displayName}
                        </div>
                    </div>
                </section>

                {/* STATUS & TIME CARD */}
                <HeroCard className="border-none shadow-sm bg-background overflow-hidden">
                    <div
                        className="absolute left-0 top-0 bottom-0 w-1.5"
                        style={{ backgroundColor: job.status.hexColor }}
                    />
                    <HeroCardBody className="p-4 flex flex-row items-center justify-between">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase text-text-subdued tracking-widest">
                                Workflow Status
                            </p>
                            <div className="flex items-center gap-2">
                                <JobStatusChip
                                    data={job.status}
                                    props={{ size: 'sm' }}
                                />
                                {!job.finishedAt && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-text-subdued">
                                        <Clock size={12} />{' '}
                                        <CountdownTimer
                                            targetDate={dayjs(job.dueAt)}
                                            mode="text"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </HeroCardBody>
                </HeroCard>

                {/* TABS SECTION */}
                <section>
                    <Tabs
                        variant="underlined"
                        color="primary"
                        selectedKey={(searchParams as { tab: string }).tab}
                        onSelectionChange={handleTabChange}
                        classNames={{
                            tabList: 'w-full border-b border-divider p-0 gap-6',
                            cursor: 'w-full bg-primary',
                            tab: 'max-w-fit px-0 h-10',
                            tabContent:
                                'group-data-[selected=true]:font-bold text-xs',
                        }}
                    >
                        <Tab key={JobDetailTabEnum.OVERVIEW} title="Overview">
                            <div className="pt-4 space-y-6">
                                {/* Description Card */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-text-subdued">
                                            Description
                                        </h3>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="flat"
                                            onPress={
                                                fullEditorDisclosure.onOpen
                                            }
                                        >
                                            <Maximize2 size={14} />
                                        </Button>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-background text-xs text-text-subdued leading-relaxed min-h-25">
                                        {job.description ? (
                                            <HtmlReactParser
                                                htmlString={job.description}
                                            />
                                        ) : (
                                            'No description provided.'
                                        )}
                                    </div>
                                </div>

                                <JobAssigneesView data={job} />

                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-text-subdued">
                                        History
                                    </h3>
                                    <JobActivityHistory logs={activityLogs} />
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key={JobDetailTabEnum.ATTACHMENTS}
                            title={`Files (${job.attachmentUrls?.length || 0})`}
                        >
                            <div className="pt-4">
                                <JobAttachmentsField
                                    defaultAttachments={job.attachmentUrls}
                                    onChange={(urls) =>
                                        updateJobMutation.mutate({
                                            jobId: job.id,
                                            data: { attachmentUrls: urls },
                                        })
                                    }
                                />
                            </div>
                        </Tab>

                        <Tab
                            key={JobDetailTabEnum.ASSIGNMENTS}
                            title="Partner Payout"
                        >
                            <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                                        <p className="text-[10px] font-bold text-primary/60 uppercase">
                                            Total Staff
                                        </p>
                                        <p className="text-lg font-black text-primary">
                                            {currencyFormatter(
                                                job.totalStaffCost || 0
                                            )}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-100 border border-divider">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                                            Usage
                                        </p>
                                        <p className="text-lg font-black text-slate-700">
                                            {budgetUsage}%
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {job.assignments?.map((asgn) => (
                                        <div
                                            key={asgn.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-divider shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={asgn.user.avatar}
                                                    size="sm"
                                                    isBordered
                                                    color="primary"
                                                />
                                                <div>
                                                    <p className="text-xs font-bold">
                                                        {asgn.user.displayName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        Partner
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-black text-primary">
                                                {isAdmin
                                                    ? currencyFormatter(
                                                          asgn.staffCost || 0
                                                      )
                                                    : '••••••'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key={JobDetailTabEnum.COMMENTS}
                            title={`Chat (${job.comments?.length || 0})`}
                        >
                            <div className="pt-4">
                                <JobCommentsView job={job} />
                            </div>
                        </Tab>
                    </Tabs>
                </section>

                {/* FINANCIAL SUMMARY SECTION */}
                <section className="pt-4 border-t border-divider space-y-3">
                    <h3 className="text-sm font-bold text-text-subdued">
                        Financial Summary
                    </h3>
                    <div className="bg-white rounded-2xl border border-divider p-4 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                                Payment Status
                            </span>
                            <PaidChip status={job.isPaid ? 'paid' : 'unpaid'} />
                        </div>
                        {isAdmin && (
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                    Income Cost
                                </span>
                                <span className="text-xs font-bold">
                                    {currencyFormatter(job.incomeCost)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">
                                Staff Payout
                            </span>
                            <span className="text-xs font-bold text-primary">
                                {currencyFormatter(
                                    job.totalStaffCost || job.staffCost
                                )}
                            </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">
                                Via Channel
                            </span>
                            <Chip
                                size="sm"
                                variant="flat"
                                radius="sm"
                                className="bg-slate-100 font-bold text-[10px]"
                            >
                                {job.paymentChannel?.displayName}
                            </Chip>
                        </div>
                    </div>
                </section>

                {/* CREATOR INFO */}
                <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-3xl text-white">
                    <Avatar
                        src={job.createdBy.avatar}
                        size="md"
                        isBordered
                        color="primary"
                        className="ring-2 ring-white/20"
                    />
                    <div>
                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
                            Created By
                        </p>
                        <p className="text-sm font-bold">
                            {job.createdBy.displayName}
                        </p>
                        <p className="text-[10px] text-white/40">
                            {dateFormatter(job.createdAt, {
                                format: 'fullShort',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* FLOATING ACTION FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background backdrop-blur-xl border-t border-divider flex gap-3 z-50">
                {isJobActive ? (
                    <Button
                        fullWidth
                        color="primary"
                        size="lg"
                        radius="full"
                        startContent={<CheckCircle2 size={20} />}
                        onPress={deliverJobDisclosure.onOpen}
                    >
                        Deliver Job
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        disabled
                        variant="flat"
                        size="lg"
                        radius="full"
                        className="font-bold"
                    >
                        Job Concluded
                    </Button>
                )}
                <Button
                    isIconOnly
                    color="danger"
                    variant="flat"
                    size="lg"
                    radius="full"
                >
                    <AlertCircle size={20} />
                </Button>
            </div>
        </>
    )
}

const PaidChip = ({ status }: { status: 'paid' | 'unpaid' }) => (
    <Chip
        size="sm"
        variant="flat"
        classNames={{ content: 'flex items-center gap-2 font-black' }}
    >
        <div
            className="size-1.5 rounded-full"
            style={{ backgroundColor: PAID_STATUS_COLOR[status].hexColor }}
        />
        <span style={{ color: PAID_STATUS_COLOR[status].hexColor }}>
            {status.toUpperCase()}
        </span>
    </Chip>
)

export default MobileJobDetailPage
