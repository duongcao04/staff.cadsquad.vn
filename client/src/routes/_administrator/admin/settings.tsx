import { APP_PERMISSIONS, usersListOptions } from '@/lib'
import { ProtectedRoute } from '@/shared/guards/protected-route'
import { ArrowRotateLeft } from '@gravity-ui/icons'
import {
    Autocomplete,
    AutocompleteItem,
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
    Tab,
    Tabs,
} from '@heroui/react'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    AlertTriangleIcon,
    BellIcon,
    BriefcaseIcon,
    ClockIcon,
    RotateCcwIcon,
    SaveIcon,
    Search,
    ShieldCheckIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPageHeading } from '../../../shared/components'
import {
    systemSettingOptions,
    upsertSystemSettingMutation,
} from '@/lib/queries'

export const Route = createFileRoute('/_administrator/admin/settings')({
    head: () => ({
        meta: [
            {
                title: 'System Configuration',
            },
        ],
    }),
    component: () => {
        return (
            <ProtectedRoute permissions={APP_PERMISSIONS.SYSTEM.MANAGE}>
                <AdminPageHeading
                    title="System Configuration"
                    description="Manage global defaults, notifications, and system health."
                    actions={
                        <Button
                            startContent={<ArrowRotateLeft fontSize={16} />}
                            variant="light"
                        >
                            Reset to default
                        </Button>
                    }
                />
                <AdminSettingsPage />
            </ProtectedRoute>
        )
    },
})

// --- DEFAULT SETTINGS (Fallback if nothing in DB) ---
export const DEFAULT_SETTINGS = {
    defaultAssigneeIds: [] as string[],
    autoCloseJobsAfterDays: 7,
    defaultJobPriority: 'MEDIUM',
    auditLogRetentionDays: 90,
    enableDetailedLogging: false,
    maintenanceMode: false,
    notifyWhenDueAt: 2,
}

// --- INTERFACE ---
interface SettingsFormValues {
    defaultAssigneeIds: string[]
    autoCloseJobsAfterDays: number
    defaultJobPriority: string
    auditLogRetentionDays: number
    enableDetailedLogging: boolean
    maintenanceMode: boolean
    notifyWhenDueAt: number
}

// Constant for the DB key we will use
const SETTING_KEY = 'SYSTEM_PREFERENCES'

function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<string>('workflow')

    // 1. Fetch Users List
    const {
        data: { users },
    } = useSuspenseQuery(usersListOptions())

    // 2. Fetch System Settings from DB
    const { data: settingRecord } = useSuspenseQuery(
        systemSettingOptions(SETTING_KEY)
    )

    // 3. Setup Mutation
    const updateMutation = useMutation(upsertSystemSettingMutation)

    // Merge default settings with whatever came from the DB (protects against missing keys)
    const initialConfigData = useMemo(() => {
        const dbConfig = settingRecord?.data || {}
        return { ...DEFAULT_SETTINGS, ...dbConfig } as SettingsFormValues
    }, [settingRecord])

    const formik = useFormik<SettingsFormValues>({
        initialValues: initialConfigData,
        enableReinitialize: true, // Updates form if DB data changes
        validate: (values) => {
            const errors: Partial<SettingsFormValues> = {}
            if (values.auditLogRetentionDays < 1) {
                errors.auditLogRetentionDays = 1 // Simplified for TS, adapt to your actual error type
            }
            if (values.notifyWhenDueAt < 0) {
                errors.notifyWhenDueAt = 0
            }
            return errors
        },
        onSubmit: async (values, { resetForm }) => {
            // Stringify the entire form state as a JSON string to match DB requirements
            await updateMutation.mutateAsync({
                key: SETTING_KEY,
                value: JSON.stringify(values),
            })

            // Reset the form state to reflect the new values as "clean" (not dirty)
            resetForm({ values })
        },
    })

    // --- ASSIGNEE LOGIC ---
    const selectedStaff = useMemo(() => {
        return users.filter((user) =>
            formik.values.defaultAssigneeIds.includes(user.id)
        )
    }, [users, formik.values.defaultAssigneeIds])

    const availableUsers = useMemo(() => {
        return users.filter(
            (user) => !formik.values.defaultAssigneeIds.includes(user.id)
        )
    }, [users, formik.values.defaultAssigneeIds])

    const handleAddMember = (userId: string | number | null) => {
        if (!userId) return
        const newIds = [...formik.values.defaultAssigneeIds, String(userId)]
        formik.setFieldValue('defaultAssigneeIds', newIds)
    }

    const handleRemoveMember = (userId: string) => {
        const newIds = formik.values.defaultAssigneeIds.filter(
            (id) => id !== userId
        )
        formik.setFieldValue('defaultAssigneeIds', newIds)
    }

    return (
        <div className="mx-auto max-w-7xl p-6 pb-24 h-[calc(100vh-4rem)]">
            <form onSubmit={formik.handleSubmit}>
                <Card shadow="none" className="border-1 border-border-default">
                    <CardHeader>
                        <Tabs
                            aria-label="Settings Sections"
                            selectedKey={activeTab}
                            onSelectionChange={(key) =>
                                setActiveTab(key as string)
                            }
                            classNames={{
                                tabList: 'gap-4 w-full',
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
                                key="system"
                                title={
                                    <div className="flex items-center gap-3">
                                        <ShieldCheckIcon size={18} />
                                        <span>System & Audit</span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </CardHeader>

                    <Divider className="bg-border-default" />

                    <CardBody>
                        <div className="flex-1 w-full space-y-6">
                            {/* TAB 1: WORKFLOW */}
                            {activeTab === 'workflow' && (
                                <Card className="border shadow-sm border-default-200">
                                    <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                        <h2 className="text-lg font-bold">
                                            Job Defaults
                                        </h2>
                                        <p className="text-small text-default-400">
                                            Preset values applied when a new job
                                            is created.
                                        </p>
                                    </CardHeader>
                                    <Divider className="my-2" />
                                    <CardBody className="flex flex-col gap-8 px-6 pb-6">
                                        {/* Default Assignees */}
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <label className="mb-1 text-sm font-semibold">
                                                    Auto-Assign Staff
                                                </label>
                                                <span className="mb-3 text-xs text-default-500">
                                                    Select staff members who
                                                    will be automatically
                                                    assigned to every new job
                                                    created in the system.
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <Autocomplete
                                                    placeholder="Search by name to add..."
                                                    variant="bordered"
                                                    allowsCustomValue={false}
                                                    onSelectionChange={
                                                        handleAddMember
                                                    }
                                                    selectedKey={null}
                                                    startContent={
                                                        <Search
                                                            size={16}
                                                            className="text-text-subdued"
                                                        />
                                                    }
                                                    defaultItems={
                                                        availableUsers
                                                    }
                                                    className="max-w-md"
                                                >
                                                    {(user) => (
                                                        <AutocompleteItem
                                                            key={user.id}
                                                            textValue={
                                                                user.displayName ||
                                                                user.username
                                                            }
                                                        >
                                                            <div className="flex items-center gap-3 py-1">
                                                                <Avatar
                                                                    size="sm"
                                                                    src={
                                                                        user.avatar
                                                                    }
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">
                                                                        {user.displayName ||
                                                                            user.username}
                                                                    </span>
                                                                    <span className="text-xs text-default-400">
                                                                        {user
                                                                            .jobTitle
                                                                            ?.displayName ||
                                                                            'Staff'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </AutocompleteItem>
                                                    )}
                                                </Autocomplete>

                                                {/* Selected Staff List */}
                                                <div className="flex flex-wrap items-center gap-2 p-4 border bg-default-50 rounded-xl border-default-100 min-h-15">
                                                    {selectedStaff.length >
                                                    0 ? (
                                                        selectedStaff.map(
                                                            (user) => (
                                                                <Chip
                                                                    key={
                                                                        user.id
                                                                    }
                                                                    onClose={() =>
                                                                        handleRemoveMember(
                                                                            user.id
                                                                        )
                                                                    }
                                                                    avatar={
                                                                        <Avatar
                                                                            src={
                                                                                user.avatar
                                                                            }
                                                                        />
                                                                    }
                                                                    variant="flat"
                                                                    color="primary"
                                                                    className="px-1 shadow-sm"
                                                                >
                                                                    {user.displayName ||
                                                                        user.username}
                                                                </Chip>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-sm italic text-default-400">
                                                            No auto-assigned
                                                            staff selected.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Divider />

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            {/* Default Priority */}
                                            <Select
                                                label="Default Priority"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                classNames={{
                                                    label: 'font-semibold',
                                                }}
                                                selectedKeys={[
                                                    formik.values
                                                        .defaultJobPriority,
                                                ]}
                                                onSelectionChange={(keys) =>
                                                    formik.setFieldValue(
                                                        'defaultJobPriority',
                                                        Array.from(keys)[0]
                                                    )
                                                }
                                            >
                                                <SelectItem key="LOW">
                                                    Low
                                                </SelectItem>
                                                <SelectItem key="MEDIUM">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem key="HIGH">
                                                    High
                                                </SelectItem>
                                                <SelectItem key="URGENT">
                                                    Urgent
                                                </SelectItem>
                                            </Select>

                                            {/* Auto Close */}
                                            <Input
                                                label="Auto-Close Finished Jobs"
                                                type="number"
                                                variant="bordered"
                                                labelPlacement="outside"
                                                classNames={{
                                                    label: 'font-semibold',
                                                }}
                                                name="autoCloseJobsAfterDays"
                                                value={String(
                                                    formik.values
                                                        .autoCloseJobsAfterDays
                                                )}
                                                onChange={formik.handleChange}
                                                endContent={
                                                    <span className="text-sm text-default-400">
                                                        Days
                                                    </span>
                                                }
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* TAB 2: NOTIFICATIONS */}
                            {activeTab === 'notifications' && (
                                <Card className="border shadow-sm border-default-200">
                                    <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                        <h2 className="text-lg font-bold">
                                            Alerts & Deadlines
                                        </h2>
                                        <p className="text-small text-default-400">
                                            Configure when the system
                                            proactively alerts staff.
                                        </p>
                                    </CardHeader>
                                    <Divider className="my-2" />
                                    <CardBody className="px-6 pb-6">
                                        <div className="flex flex-col items-start justify-between gap-4 p-4 border rounded-large bg-primary-50/50 border-primary-100 md:flex-row md:items-center">
                                            <div className="flex gap-4">
                                                <div className="hidden p-2 rounded-full bg-primary-100 text-primary md:block">
                                                    <ClockIcon size={24} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-medium text-foreground">
                                                        Upcoming Deadline Alert
                                                    </span>
                                                    <span className="text-small text-default-500">
                                                        Notify the assigned
                                                        staff member(s) when a
                                                        job is approaching its
                                                        Due Date.
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-48 shrink-0">
                                                <Input
                                                    type="number"
                                                    size="lg"
                                                    variant="flat"
                                                    color="primary"
                                                    label="Notify before"
                                                    placeholder="2"
                                                    min={0}
                                                    name="notifyWhenDueAt"
                                                    value={String(
                                                        formik.values
                                                            .notifyWhenDueAt
                                                    )}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    endContent={
                                                        <span className="text-xs font-medium text-default-500">
                                                            Days
                                                        </span>
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* TAB 3: SYSTEM */}
                            {activeTab === 'system' && (
                                <Card className="border shadow-sm border-default-200">
                                    <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                        <h2 className="text-lg font-bold">
                                            System & Auditing
                                        </h2>
                                        <p className="text-small text-default-400">
                                            Technical configurations for logs
                                            and access.
                                        </p>
                                    </CardHeader>
                                    <Divider className="my-2" />
                                    <CardBody className="grid grid-cols-1 gap-6 px-6 pb-6">
                                        {/* Detailed Logging */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg border-default-200 bg-default-50">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold">
                                                    Detailed Write Logging
                                                </span>
                                                <span className="text-tiny text-default-500">
                                                    Log "Previous" vs "New"
                                                    values. Increases DB size.
                                                </span>
                                            </div>
                                            <Switch
                                                color="warning"
                                                isSelected={
                                                    formik.values
                                                        .enableDetailedLogging
                                                }
                                                onValueChange={(val) =>
                                                    formik.setFieldValue(
                                                        'enableDetailedLogging',
                                                        val
                                                    )
                                                }
                                            />
                                        </div>

                                        {/* Log Retention */}
                                        <div className="flex items-center justify-between p-3 border rounded-lg border-default-200 bg-default-50">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold">
                                                    Audit Log Retention
                                                </span>
                                                <span className="text-tiny text-default-500">
                                                    Delete logs older than this
                                                    duration.
                                                </span>
                                            </div>
                                            <div className="w-32">
                                                <Input
                                                    type="number"
                                                    size="sm"
                                                    variant="flat"
                                                    name="auditLogRetentionDays"
                                                    value={String(
                                                        formik.values
                                                            .auditLogRetentionDays
                                                    )}
                                                    onChange={
                                                        formik.handleChange
                                                    }
                                                    endContent={
                                                        <span className="text-xs text-default-400">
                                                            Days
                                                        </span>
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Maintenance Mode */}
                                        <div className="flex items-center justify-between p-4 border rounded-lg bg-danger-50/50 border-danger-100">
                                            <div className="flex items-center gap-3">
                                                <div className="text-danger">
                                                    <AlertTriangleIcon
                                                        size={24}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-danger-900">
                                                        Maintenance Mode
                                                    </span>
                                                    <span className="text-tiny text-danger-700">
                                                        Block non-admin access
                                                        immediately.
                                                    </span>
                                                </div>
                                            </div>
                                            <Switch
                                                color="danger"
                                                size="sm"
                                                isSelected={
                                                    formik.values
                                                        .maintenanceMode
                                                }
                                                onValueChange={(val) =>
                                                    formik.setFieldValue(
                                                        'maintenanceMode',
                                                        val
                                                    )
                                                }
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </CardBody>
                </Card>
            </form>

            {/* --- FLOATING SAVE BAR --- */}
            <div className="fixed z-50 w-full max-w-2xl px-4 -translate-x-1/2 bottom-6 left-1/2">
                <div className="flex items-center justify-between p-4 border shadow-xl rounded-2xl bg-content1/90 backdrop-blur-md border-default-200">
                    <div className="flex flex-col">
                        <span className="font-bold text-small">
                            Configuration
                        </span>
                        <span
                            className={`text-tiny font-medium ${formik.dirty ? 'text-warning-500' : 'text-success-500'}`}
                        >
                            {formik.dirty
                                ? 'Unsaved changes pending'
                                : 'All systems operational'}
                        </span>
                    </div>
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
                </div>
            </div>
        </div>
    )
}
