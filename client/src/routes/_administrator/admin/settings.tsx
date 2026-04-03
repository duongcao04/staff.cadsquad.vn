import {
    APP_PERMISSIONS,
    SettingsFormValues,
    sharepointFolderDetailOptions,
    SystemSettingHelper,
    usersListOptions,
} from '@/lib'
import {
    systemSettingsListOptions,
    upsertSystemSettingMutation,
} from '@/lib/queries'
import { AdminPageHeading, AppLoading } from '@/shared/components'
import { ProtectedRoute } from '@/shared/guards/protected-route'
import { TUser } from '@/shared/types'
import { Xmark } from '@gravity-ui/icons'
import {
    addToast,
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Switch,
    Tab,
    Tabs,
} from '@heroui/react'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    AlertTriangleIcon,
    BellIcon,
    BriefcaseIcon,
    ClockIcon,
    ExternalLinkIcon,
    FolderIcon,
    LockIcon,
    NetworkIcon,
    RotateCcwIcon,
    SaveIcon,
    Search,
    ShieldCheckIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_administrator/admin/settings')({
    head: () => ({ meta: [{ title: 'System Configuration' }] }),
    pendingComponent: AppLoading,
    component: () => (
        <ProtectedRoute permissions={APP_PERMISSIONS.SYSTEM.MANAGE}>
            <AdminSettingsPage />
        </ProtectedRoute>
    ),
})

function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('workflow')

    const {
        data: { users },
    } = useSuspenseQuery(usersListOptions())
    const { data: settingsData, refetch } = useSuspenseQuery(
        systemSettingsListOptions()
    )
    const updateMutation = useMutation(upsertSystemSettingMutation)

    const initialConfigData = useMemo(() => {
        return SystemSettingHelper.parseSettings(
            settingsData?.settings || []
        ) as SettingsFormValues
    }, [settingsData])

    const formik = useFormik<SettingsFormValues>({
        initialValues: initialConfigData,
        enableReinitialize: true,
        validate: (values) => {
            const errors: Partial<SettingsFormValues> = {}
            if (values.auditLogRetentionDays < 1)
                errors.auditLogRetentionDays = 1 as any
            if (values.notifyWhenDueAt < 0) errors.notifyWhenDueAt = 0 as any
            if (values.sessionTimeoutMinutes < 5)
                errors.sessionTimeoutMinutes = 5 as any
            if (values.autoCancelJobsAfterDaysLate < 0)
                errors.autoCancelJobsAfterDaysLate = 0 as any
            if (values.autoUpgradePriorityDaysBeforeDue < 0)
                errors.autoUpgradePriorityDaysBeforeDue = 0 as any
            return errors
        },
        onSubmit: async (values, { resetForm }) => {
            // 1. Create an array to hold only the changed settings
            const modifiedPayload: { key: string; value: string }[] = []

            // 2. Loop through all current values to find what changed
            Object.entries(values).forEach(([key, val]) => {
                // Get the original value from when the form loaded
                const initialVal =
                    initialConfigData[key as keyof SettingsFormValues]

                // Safely convert both to strings (this perfectly handles your array comparison too)
                const stringifiedNewVal = Array.isArray(val)
                    ? JSON.stringify(val)
                    : String(val)
                const stringifiedInitialVal = Array.isArray(initialVal)
                    ? JSON.stringify(initialVal)
                    : String(initialVal)

                // 3. If they don't match, it means the user changed this specific field
                if (stringifiedNewVal !== stringifiedInitialVal) {
                    modifiedPayload.push({
                        key,
                        value: stringifiedNewVal,
                    })
                }
            })

            // Sanity check: If nothing actually changed, just reset and exit early
            if (modifiedPayload.length === 0) {
                resetForm({ values })
                return
            }

            // 4. Execute the API calls ONLY for the keys inside modifiedPayload
            await Promise.all(
                modifiedPayload.map((setting) =>
                    updateMutation.mutateAsync(setting)
                )
            )

            addToast({
                title: 'Successfully',
                description: 'Update system configuration successfully',
                color: 'success',
            })

            refetch()

            // 5. Reset the form state so Formik knows the new values are now the "clean" state
            resetForm({ values })
        },
    })

    // Staff Assignee Computed Data
    const selectedStaff = useMemo(
        () =>
            users.filter((u) =>
                formik.values.defaultAssigneeIds.includes(u.id)
            ),
        [users, formik.values.defaultAssigneeIds]
    )
    const availableUsers = useMemo(
        () =>
            users.filter(
                (u) => !formik.values.defaultAssigneeIds.includes(u.id)
            ),
        [users, formik.values.defaultAssigneeIds]
    )

    const {
        data: folderData,
        refetch: checkFolder,
        isFetching: isCheckingFolder,
        isError: isFolderError,
    } = useQuery({
        ...sharepointFolderDetailOptions(formik.values.sharepointRootFolderId),
        enabled: false,
        retry: false,
    })

    const handleCheckFolder = () => {
        if (!formik.values.sharepointRootFolderId) return
        checkFolder()
    }

    return (
        <div className="p-6 pb-24 mx-auto max-w-7xl h-[calc(100vh-4rem)] overflow-y-auto">
            <AdminPageHeading
                title="System Configuration"
                description="Manage global defaults, notifications, and system health."
                actions={
                    <div className="flex gap-3">
                        <Button
                            variant="light"
                            onPress={() => formik.resetForm()}
                            isDisabled={
                                !formik.dirty || updateMutation.isPending
                            }
                            startContent={<RotateCcwIcon size={16} />}
                        >
                            Reset
                        </Button>
                        <Button
                            color="primary"
                            onPress={() => formik.submitForm()}
                            isLoading={updateMutation.isPending}
                            isDisabled={!formik.dirty}
                            className="shadow-md"
                            startContent={
                                !updateMutation.isPending && (
                                    <SaveIcon size={18} />
                                )
                            }
                        >
                            Save Changes
                        </Button>
                    </div>
                }
            />

            <form onSubmit={formik.handleSubmit} className="mt-6">
                <Card
                    shadow="none"
                    className="border-1 border-border-default min-h-150"
                >
                    {/* TABS NAVIGATION */}
                    <CardHeader className="flex-col items-start px-0 pt-0">
                        <div className="w-full px-4 pt-4 overflow-x-auto hide-scrollbar">
                            <Tabs
                                aria-label="Settings Sections"
                                selectedKey={activeTab}
                                onSelectionChange={(key) =>
                                    setActiveTab(key as string)
                                }
                                classNames={{
                                    tabList:
                                        'gap-4 w-full flex-wrap md:flex-nowrap',
                                    cursor: 'w-full bg-primary/20',
                                    tab: 'px-4 h-12 justify-start text-left',
                                    tabContent:
                                        'group-data-[selected=true]:font-bold group-data-[selected=true]:text-primary',
                                }}
                                variant="light"
                                color="primary"
                            >
                                <Tab
                                    key="workflow"
                                    title={
                                        <div className="flex items-center gap-3">
                                            <BriefcaseIcon size={18} />
                                            <span>Workflow</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="notifications"
                                    title={
                                        <div className="flex items-center gap-3">
                                            <BellIcon size={18} />
                                            <span>Notifications</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="integrations"
                                    title={
                                        <div className="flex items-center gap-3">
                                            <NetworkIcon size={18} />
                                            <span>Integrations</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="security"
                                    title={
                                        <div className="flex items-center gap-3">
                                            <LockIcon size={18} />
                                            <span>Security</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="system"
                                    title={
                                        <div className="flex items-center gap-3">
                                            <ShieldCheckIcon size={18} />
                                            <span>System & Audit</span>
                                        </div>
                                    }
                                />
                            </Tabs>
                        </div>
                    </CardHeader>

                    <Divider className="bg-border-default" />

                    {/* TAB CONTENTS */}
                    <CardBody className="px-6 py-6">
                        <div className="flex-1 w-full space-y-6">
                            {/* --- WORKFLOW TAB --- */}
                            {activeTab === 'workflow' && (
                                <SectionCard
                                    title="Job Defaults & Rules"
                                    description="Preset values and automations applied to jobs."
                                >
                                    <StaffAssignmentBox
                                        availableUsers={availableUsers}
                                        selectedStaff={selectedStaff}
                                        onAdd={(id) =>
                                            formik.setFieldValue(
                                                'defaultAssigneeIds',
                                                [
                                                    ...formik.values
                                                        .defaultAssigneeIds,
                                                    String(id),
                                                ]
                                            )
                                        }
                                        onRemove={(id) =>
                                            formik.setFieldValue(
                                                'defaultAssigneeIds',
                                                formik.values.defaultAssigneeIds.filter(
                                                    (uid) => uid !== id
                                                )
                                            )
                                        }
                                    />

                                    <Divider />

                                    <div className="flex flex-col gap-4">
                                        <h3 className="mb-1 text-sm font-bold tracking-wider uppercase text-default-700">
                                            Deadline Automations
                                        </h3>
                                        <SettingInputRow
                                            title="Auto-Upgrade Approaching Deadlines"
                                            description="Automatically move job to 'Urgent' if deadline is within this many days (0 to disable)."
                                            name="autoUpgradePriorityDaysBeforeDue"
                                            value={String(
                                                formik.values
                                                    .autoUpgradePriorityDaysBeforeDue
                                            )}
                                            onChange={formik.handleChange}
                                            endContent={
                                                <span className="text-xs text-default-400">
                                                    Days
                                                </span>
                                            }
                                        />
                                        <SettingInputRow
                                            title="Auto-Cancel Severely Late Jobs"
                                            description="Automatically change status to 'Cancelled' if job is past due by this many days (0 to disable)."
                                            name="autoCancelJobsAfterDaysLate"
                                            value={String(
                                                formik.values
                                                    .autoCancelJobsAfterDaysLate
                                            )}
                                            onChange={formik.handleChange}
                                            endContent={
                                                <span className="text-xs text-default-400">
                                                    Days
                                                </span>
                                            }
                                        />
                                    </div>
                                </SectionCard>
                            )}

                            {/* --- NOTIFICATIONS TAB --- */}
                            {activeTab === 'notifications' && (
                                <SectionCard
                                    title="Alerts & Deadlines"
                                    description="Configure when the system proactively alerts staff."
                                >
                                    <SettingInputRow
                                        title="Upcoming Deadline Alert"
                                        description="Notify assigned staff when a job is approaching its Due Date."
                                        widthClass="w-full md:w-48"
                                        name="notifyWhenDueAt"
                                        value={String(
                                            formik.values.notifyWhenDueAt
                                        )}
                                        onChange={formik.handleChange}
                                        endContent={
                                            <span className="text-xs font-medium text-default-500">
                                                Days
                                            </span>
                                        }
                                    />
                                </SectionCard>
                            )}

                            {/* --- INTEGRATIONS TAB --- */}
                            {activeTab === 'integrations' && (
                                <SectionCard
                                    title="External Integrations"
                                    description="Manage connections to third-party services like SharePoint."
                                >
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2.5">
                                            <p className="text-sm font-semibold">
                                                SharePoint Root Folder ID
                                            </p>
                                            <div className="flex items-start gap-3">
                                                <Input
                                                    variant="bordered"
                                                    labelPlacement="outside"
                                                    classNames={{
                                                        mainWrapper: 'w-full',
                                                    }}
                                                    name="sharepointRootFolderId"
                                                    value={
                                                        formik.values
                                                            .sharepointRootFolderId
                                                    }
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    placeholder="e.g. 01XYZ..."
                                                    description="The master folder ID where all job sub-folders will be created."
                                                />
                                                <Button
                                                    color="primary"
                                                    variant="flat"
                                                    onPress={handleCheckFolder}
                                                    isLoading={isCheckingFolder}
                                                    startContent={
                                                        !isCheckingFolder && (
                                                            <Search size={18} />
                                                        )
                                                    }
                                                    isDisabled={
                                                        !formik.values
                                                            .sharepointRootFolderId
                                                    }
                                                >
                                                    Check
                                                </Button>
                                            </div>
                                            {folderData && (
                                                <Card
                                                    shadow="none"
                                                    className="border bg-success-50/20 border-success-200"
                                                >
                                                    <CardBody className="p-0">
                                                        {/* Header Area */}
                                                        <div className="flex items-center gap-4 p-4 border-b border-success-100">
                                                            <div className="p-3 rounded-xl bg-success-100 text-success-600">
                                                                <FolderIcon
                                                                    size={24}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                <span className="text-sm font-bold leading-tight text-success-900">
                                                                    {
                                                                        folderData.name
                                                                    }
                                                                </span>
                                                                <span className="max-w-md text-xs truncate text-success-600">
                                                                    {
                                                                        folderData.displayPath
                                                                    }
                                                                </span>
                                                            </div>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="flat"
                                                                color="success"
                                                                onPress={() =>
                                                                    window.open(
                                                                        folderData.webUrl,
                                                                        '_blank'
                                                                    )
                                                                }
                                                                title="Open in SharePoint"
                                                            >
                                                                <ExternalLinkIcon
                                                                    size={16}
                                                                />
                                                            </Button>
                                                        </div>

                                                        {/* Detailed Grid Area */}
                                                        <div className="grid grid-cols-2 p-4 gap-y-4 gap-x-8 bg-white/50 dark:bg-default-50/20">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-default-400">
                                                                    Total Items
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <ShieldCheckIcon
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="text-success-500"
                                                                    />
                                                                    <span className="text-sm font-semibold">
                                                                        {
                                                                            folderData.childCount
                                                                        }{' '}
                                                                        Sub-folders/files
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-default-400">
                                                                    Created By
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar
                                                                        name={
                                                                            folderData.ownerName
                                                                        }
                                                                        size="sm"
                                                                        className="w-4 h-4 text-[8px]"
                                                                    />
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            folderData.ownerName
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-default-400">
                                                                    Last
                                                                    Modified
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <ClockIcon
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="text-default-400"
                                                                    />
                                                                    <span className="text-sm">
                                                                        {new Date(
                                                                            folderData.lastModified
                                                                        ).toLocaleDateString(
                                                                            'vi-VN'
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-[10px] uppercase font-bold text-default-400">
                                                                    Storage Size
                                                                </span>
                                                                <span className="text-sm font-medium">
                                                                    {
                                                                        folderData.sizeInMB
                                                                    }{' '}
                                                                    MB
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Status Footer */}
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-success-100/50">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                                                            <span className="text-[10px] font-bold text-success-700 uppercase">
                                                                Connection
                                                                Verified
                                                            </span>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            )}

                                            {/* ERROR STATE */}
                                            {isFolderError && (
                                                <Card
                                                    shadow="none"
                                                    className="border bg-danger-50/30 border-danger-200"
                                                >
                                                    <CardBody className="flex items-center gap-3 p-3">
                                                        <AlertTriangleIcon
                                                            size={18}
                                                            className="text-danger"
                                                        />
                                                        <span className="text-sm font-medium text-danger-700">
                                                            Invalid Folder ID.
                                                            Please verify the ID
                                                            in SharePoint.
                                                        </span>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>

                                        <SettingToggleRow
                                            title="Auto-Create Job Folders"
                                            description="Automatically generate a SharePoint folder when a new Job is created."
                                            isSelected={
                                                formik.values
                                                    .autoCreateSharepointFolders
                                            }
                                            onValueChange={(val: boolean) =>
                                                formik.setFieldValue(
                                                    'autoCreateSharepointFolders',
                                                    val
                                                )
                                            }
                                        />
                                    </div>
                                </SectionCard>
                            )}

                            {/* --- SECURITY TAB --- */}
                            {activeTab === 'security' && (
                                <SectionCard
                                    title="Access & Security"
                                    description="Configure authentication boundaries and session limits."
                                >
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Input
                                            label="Session Timeout"
                                            type="number"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            classNames={{
                                                label: 'font-semibold',
                                            }}
                                            name="sessionTimeoutMinutes"
                                            value={String(
                                                formik.values
                                                    .sessionTimeoutMinutes
                                            )}
                                            onChange={formik.handleChange}
                                            description="How long a user stays logged in idly."
                                            endContent={
                                                <span className="text-sm text-default-400">
                                                    Mins
                                                </span>
                                            }
                                        />
                                        <Input
                                            label="Max Login Attempts"
                                            type="number"
                                            variant="bordered"
                                            labelPlacement="outside"
                                            classNames={{
                                                label: 'font-semibold',
                                            }}
                                            name="maxLoginAttempts"
                                            value={String(
                                                formik.values.maxLoginAttempts
                                            )}
                                            onChange={formik.handleChange}
                                            description="Lock account after X failed attempts."
                                            endContent={
                                                <span className="text-sm text-default-400">
                                                    Tries
                                                </span>
                                            }
                                        />
                                    </div>
                                    <SettingToggleRow
                                        title="Require Email Verification"
                                        description="New users must verify their email before accessing the portal."
                                        isSelected={
                                            formik.values
                                                .requireEmailVerification
                                        }
                                        onValueChange={(val: boolean) =>
                                            formik.setFieldValue(
                                                'requireEmailVerification',
                                                val
                                            )
                                        }
                                    />
                                </SectionCard>
                            )}

                            {/* --- SYSTEM TAB --- */}
                            {activeTab === 'system' && (
                                <SectionCard
                                    title="System & Auditing"
                                    description="Technical configurations for logs and maintenance."
                                >
                                    <SettingToggleRow
                                        title="Detailed Write Logging"
                                        color="warning"
                                        description='Log "Previous" vs "New" values. Increases DB size.'
                                        isSelected={
                                            formik.values.enableDetailedLogging
                                        }
                                        onValueChange={(val: boolean) =>
                                            formik.setFieldValue(
                                                'enableDetailedLogging',
                                                val
                                            )
                                        }
                                    />
                                    <SettingInputRow
                                        title="Audit Log Retention"
                                        description="Delete logs older than this duration."
                                        name="auditLogRetentionDays"
                                        value={String(
                                            formik.values.auditLogRetentionDays
                                        )}
                                        onChange={formik.handleChange}
                                        endContent={
                                            <span className="text-xs text-default-400">
                                                Days
                                            </span>
                                        }
                                    />
                                    <SettingToggleRow
                                        title="Maintenance Mode"
                                        color="danger"
                                        icon={AlertTriangleIcon}
                                        iconColor="danger"
                                        description="Block non-admin access immediately."
                                        isSelected={
                                            formik.values.maintenanceMode
                                        }
                                        onValueChange={(val: boolean) =>
                                            formik.setFieldValue(
                                                'maintenanceMode',
                                                val
                                            )
                                        }
                                    />
                                </SectionCard>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </form>

            {/* --- FLOATING STATUS BAR (Only shows when there are unsaved changes) --- */}
            {formik.dirty && (
                <div className="fixed z-50 w-full max-w-sm px-4 -translate-x-1/2 bottom-6 left-1/2">
                    <div className="flex items-center justify-center p-3 border shadow-xl rounded-2xl bg-warning-50/90 backdrop-blur-md border-warning-200">
                        <span className="text-sm font-semibold text-warning-700">
                            You have unsaved changes pending
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================
function StaffAssignmentBox({
    availableUsers,
    selectedStaff,
    onAdd,
    onRemove,
}: {
    availableUsers: TUser[]
    selectedStaff: TUser[]
    onAdd: (id: string) => void
    onRemove: (id: string) => void
}) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <label className="mb-1 text-sm font-semibold">
                    Auto-Assign Staff
                </label>
                <span className="mb-3 text-xs text-default-500">
                    Select staff members who will be automatically assigned to
                    every new job.
                </span>
            </div>
            <div className="flex flex-col gap-4">
                <Autocomplete
                    placeholder="Search by name to add..."
                    variant="bordered"
                    allowsCustomValue={false}
                    onSelectionChange={(key) => {
                        if (key) {
                            onAdd(key.toString())
                        }
                    }}
                    selectedKey={null}
                    className="max-w-md"
                    startContent={
                        <Search size={16} className="text-text-subdued" />
                    }
                    defaultItems={availableUsers}
                >
                    {(user: any) => (
                        <AutocompleteItem
                            key={user.id}
                            textValue={user.displayName || user.username}
                        >
                            <div className="flex items-center gap-3 py-1">
                                <Avatar size="sm" src={user.avatar} />
                                <div className="flex flex-col">
                                    <span className="text-xs text-default-400">
                                        #{user.code}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {user.displayName || user.username}
                                    </span>
                                </div>
                            </div>
                        </AutocompleteItem>
                    )}
                </Autocomplete>

                <div className="flex flex-wrap items-start gap-3 p-4 border bg-background-muted rounded-xl border-default-200 min-h-20">
                    {selectedStaff.length > 0 ? (
                        selectedStaff.map((user: any) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3 p-2 pr-3 transition-colors bg-white border shadow-sm rounded-xl border-default-200 hover:border-default-300 dark:bg-default-100"
                            >
                                <Avatar
                                    src={user.avatar}
                                    size="sm"
                                    radius="md"
                                />
                                <div className="flex flex-col justify-center pr-2">
                                    <span className="text-sm font-semibold leading-tight text-foreground">
                                        {user.displayName || user.username}
                                    </span>
                                    <span className="text-xs font-medium text-default-500">
                                        Code:{' '}
                                        {user.code ||
                                            `EMP-${user.id.slice(0, 4)}`}
                                    </span>
                                </div>
                                <div className="pl-2 border-l border-default-100">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="danger"
                                        radius="full"
                                        onPress={() => onRemove(user.id)}
                                    >
                                        <Xmark
                                            fontSize={16}
                                            strokeWidth={2.5}
                                        />
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full h-full">
                            <span className="text-sm italic text-default-400">
                                No auto-assigned staff selected.
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const SectionCard = ({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: React.ReactNode
}) => (
    <Card shadow="none" className="border border-border-default">
        <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-small text-default-400">{description}</p>
        </CardHeader>
        <Divider className="my-2" />
        <CardBody className="flex flex-col gap-8 px-6 pb-6">
            {children}
        </CardBody>
    </Card>
)

const SettingToggleRow = ({
    title,
    description,
    isSelected,
    onValueChange,
    color = 'primary',
    icon: Icon,
    iconColor,
}: any) => (
    <div
        className={`flex items-center justify-between p-4 border rounded-lg border-default-200 ${iconColor ? `bg-${iconColor}-50/50 border-${iconColor}-100` : 'bg-default-50'}`}
    >
        <div className="flex items-center gap-4 pr-4">
            {Icon && (
                <div
                    className={`hidden p-2 rounded-full md:block bg-${iconColor}-100 text-${iconColor}`}
                >
                    <Icon size={24} />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <span
                    className={`text-sm font-bold ${iconColor ? `text-${iconColor}-900` : ''}`}
                >
                    {title}
                </span>
                <span
                    className={`text-tiny ${iconColor ? `text-${iconColor}-700` : 'text-default-500'}`}
                >
                    {description}
                </span>
            </div>
        </div>
        <Switch
            color={color}
            isSelected={isSelected}
            onValueChange={onValueChange}
            size={iconColor ? 'sm' : 'md'}
        />
    </div>
)

const SettingInputRow = ({
    title,
    description,
    widthClass = 'w-32',
    ...inputProps
}: any) => (
    <div className="flex items-center justify-between p-4 border rounded-lg border-default-200 bg-default-50">
        <div className="flex flex-col gap-1 pr-4">
            <span className="text-sm font-bold">{title}</span>
            <span className="text-tiny text-default-500">{description}</span>
        </div>
        <div className={`shrink-0 ${widthClass}`}>
            <Input size="sm" variant="flat" {...inputProps} />
        </div>
    </div>
)
