import {
    Avatar,
    AvatarGroup,
    Button,
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Select,
    SelectItem,
    Switch,
    Tab,
    Tabs,
} from '@heroui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    AlertTriangleIcon,
    BellIcon,
    BriefcaseIcon,
    ClockIcon,
    RotateCcwIcon,
    SaveIcon,
    ShieldCheckIcon,
} from 'lucide-react'
import { useState } from 'react'

import { getPageTitle } from '../../../lib'

export const Route = createFileRoute('/_administrator/admin/settings')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('System Configuration'),
            },
        ],
    }),
    component: AdminSettingsPage,
})

// --- MOCK DATA ---
export const MOCK_STAFF_LIST = [
    {
        id: 'u-1',
        name: 'Alice Manager',
        role: 'ADMIN',
        avatar: 'https://i.pravatar.cc/150?u=1',
    },
    {
        id: 'u-2',
        name: 'Bob Technician',
        role: 'STAFF',
        avatar: 'https://i.pravatar.cc/150?u=2',
    },
    {
        id: 'u-3',
        name: 'Charlie Dev',
        role: 'STAFF',
        avatar: 'https://i.pravatar.cc/150?u=3',
    },
    {
        id: 'u-4',
        name: 'Diana Sales',
        role: 'ACCOUNTING',
        avatar: 'https://i.pravatar.cc/150?u=4',
    },
]

export const MOCK_SETTINGS_RESPONSE = {
    defaultAssigneeIds: ['u-2', 'u-3'],
    autoCloseJobsAfterDays: 7,
    defaultJobPriority: 'MEDIUM',
    auditLogRetentionDays: 90,
    enableDetailedLogging: true,
    maintenanceMode: false,
    // NEW FIELD
    notifyWhenDueAt: 2, // Default: Notify 2 days before
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

function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<string>('workflow')

    const formik = useFormik<SettingsFormValues>({
        initialValues: MOCK_SETTINGS_RESPONSE,
        validate: (values) => {
            const errors: Partial<SettingsFormValues> = {}
            if (values.auditLogRetentionDays < 1) {
                // @ts-ignore
                errors.auditLogRetentionDays = 'Must be at least 1 day'
            }
            if (values.notifyWhenDueAt < 0) {
                // @ts-ignore
                errors.notifyWhenDueAt = 'Cannot be negative'
            }
            return errors
        },
        onSubmit: async (values) => {
            setIsSaving(true)
            console.log('Submitting Config to API:', values)
            await new Promise((resolve) => setTimeout(resolve, 1500))
            setIsSaving(false)
        },
    })

    const selectedStaff = MOCK_STAFF_LIST.filter((user) =>
        formik.values.defaultAssigneeIds.includes(user.id)
    )

    return (
        <div className="mx-auto max-w-7xl p-6 pb-24 h-[calc(100vh-4rem)]">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    System Configuration
                </h1>
                <p className="text-default-500 mt-1">
                    Manage global defaults, notifications, and system health.
                </p>
            </div>

            <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col lg:flex-row gap-8 items-start"
            >
                {/* --- LEFT SIDEBAR (TABS) --- */}
                <Card className="w-full lg:w-64 shrink-0 p-2 sticky top-4">
                    <Tabs
                        aria-label="Settings Sections"
                        isVertical
                        selectedKey={activeTab}
                        onSelectionChange={(key) => setActiveTab(key as string)}
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
                </Card>

                {/* --- RIGHT CONTENT AREA --- */}
                <div className="flex-1 w-full space-y-6">
                    {/* TAB 1: WORKFLOW */}
                    {activeTab === 'workflow' && (
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                <h2 className="text-lg font-bold">
                                    Job Defaults
                                </h2>
                                <p className="text-small text-default-400">
                                    Preset values applied when a new job is
                                    created.
                                </p>
                            </CardHeader>
                            <Divider className="my-2" />
                            <CardBody className="grid grid-cols-1 gap-8 px-6 pb-6">
                                {/* Default Assignees */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium">
                                        Auto-Assign Staff
                                    </label>
                                    <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
                                        <Select
                                            selectionMode="multiple"
                                            placeholder="Select staff..."
                                            className="max-w-md"
                                            variant="bordered"
                                            selectedKeys={
                                                formik.values.defaultAssigneeIds
                                            }
                                            onSelectionChange={(keys) => {
                                                const values = Array.from(
                                                    keys
                                                ) as string[]
                                                formik.setFieldValue(
                                                    'defaultAssigneeIds',
                                                    values
                                                )
                                            }}
                                        >
                                            {MOCK_STAFF_LIST.map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    textValue={user.name}
                                                >
                                                    <div className="flex gap-2 items-center">
                                                        <Avatar
                                                            src={user.avatar}
                                                            size="sm"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-small">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-tiny text-default-400">
                                                                {user.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        {selectedStaff.length > 0 && (
                                            <AvatarGroup
                                                isBordered
                                                size="sm"
                                                max={4}
                                            >
                                                {selectedStaff.map((u) => (
                                                    <Avatar
                                                        key={u.id}
                                                        src={u.avatar}
                                                        name={u.name}
                                                    />
                                                ))}
                                            </AvatarGroup>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Default Priority */}
                                    <Select
                                        label="Default Priority"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        selectedKeys={[
                                            formik.values.defaultJobPriority,
                                        ]}
                                        onSelectionChange={(keys) =>
                                            formik.setFieldValue(
                                                'defaultJobPriority',
                                                Array.from(keys)[0]
                                            )
                                        }
                                    >
                                        <SelectItem key="LOW">Low</SelectItem>
                                        <SelectItem key="MEDIUM">
                                            Medium
                                        </SelectItem>
                                        <SelectItem key="HIGH">High</SelectItem>
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
                                        name="autoCloseJobsAfterDays"
                                        value={String(
                                            formik.values.autoCloseJobsAfterDays
                                        )}
                                        onChange={formik.handleChange}
                                        endContent={
                                            <span className="text-default-400 text-sm">
                                                Days
                                            </span>
                                        }
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* TAB 2: NOTIFICATIONS (NEW) */}
                    {activeTab === 'notifications' && (
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                <h2 className="text-lg font-bold">
                                    Alerts & Deadlines
                                </h2>
                                <p className="text-small text-default-400">
                                    Configure when the system proactively alerts
                                    staff.
                                </p>
                            </CardHeader>
                            <Divider className="my-2" />
                            <CardBody className="px-6 pb-6">
                                <div className="p-4 rounded-large bg-primary-50/50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="p-2 rounded-full bg-primary-100 text-primary hidden md:block">
                                            <ClockIcon size={24} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-medium font-medium text-foreground">
                                                Upcoming Deadline Alert
                                            </span>
                                            <span className="text-small text-default-500">
                                                Notify the assigned staff
                                                member(s) when a job is
                                                approaching its Due Date.
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
                                                formik.values.notifyWhenDueAt
                                            )}
                                            onChange={formik.handleChange}
                                            endContent={
                                                <span className="text-default-500 text-xs font-medium">
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
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-2">
                                <h2 className="text-lg font-bold">
                                    System & Auditing
                                </h2>
                                <p className="text-small text-default-400">
                                    Technical configurations for logs and
                                    access.
                                </p>
                            </CardHeader>
                            <Divider className="my-2" />
                            <CardBody className="grid grid-cols-1 gap-6 px-6 pb-6">
                                {/* Detailed Logging */}
                                <div className="flex items-center justify-between p-3 rounded-lg border border-default-200">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            Detailed Write Logging
                                        </span>
                                        <span className="text-tiny text-default-400">
                                            Log "Previous" vs "New" values.
                                            Increases DB size.
                                        </span>
                                    </div>
                                    <Switch
                                        color="warning"
                                        isSelected={
                                            formik.values.enableDetailedLogging
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
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium">
                                            Audit Log Retention
                                        </span>
                                        <span className="text-tiny text-default-400">
                                            Delete logs older than this.
                                        </span>
                                    </div>
                                    <div className="w-32">
                                        <Input
                                            type="number"
                                            size="sm"
                                            variant="bordered"
                                            name="auditLogRetentionDays"
                                            value={String(
                                                formik.values
                                                    .auditLogRetentionDays
                                            )}
                                            onChange={formik.handleChange}
                                            endContent={
                                                <span className="text-default-400 text-xs">
                                                    Days
                                                </span>
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Maintenance Mode */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-danger-50/50 border border-danger-100">
                                    <div className="flex gap-3 items-center">
                                        <div className="text-danger">
                                            <AlertTriangleIcon size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-danger-900">
                                                Maintenance Mode
                                            </span>
                                            <span className="text-tiny text-danger-700">
                                                Block non-admin access.
                                            </span>
                                        </div>
                                    </div>
                                    <Switch
                                        color="danger"
                                        size="sm"
                                        isSelected={
                                            formik.values.maintenanceMode
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
            </form>

            {/* --- FLOATING SAVE BAR --- */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
                <div className="p-4 rounded-xl bg-content1/80 backdrop-blur-md shadow-lg border border-default-200 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-small font-medium">
                            Configuration
                        </span>
                        <span className="text-tiny text-default-400">
                            {formik.dirty
                                ? 'Unsaved changes pending'
                                : 'All systems operational'}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="light"
                            onPress={() => formik.resetForm()}
                            isDisabled={!formik.dirty || isSaving}
                            startContent={<RotateCcwIcon size={16} />}
                        >
                            Reset
                        </Button>
                        <Button
                            color="primary"
                            onPress={() => formik.submitForm()}
                            isLoading={isSaving}
                            isDisabled={!formik.dirty}
                            className="shadow-lg shadow-primary/20"
                            startContent={!isSaving && <SaveIcon size={18} />}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
