import { createFileRoute } from '@tanstack/react-router'
import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
    Snippet,
    Tab,
    Tabs,
    Textarea,
} from '@heroui/react'
import {
    Briefcase,
    Building2,
    Clock,
    Link as LinkIcon,
    Mail,
    Send,
    Shield,
    UserPlus,
    X,
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute(
    '/_administrator/admin/mgmt/invite-member'
)({
    component: InviteMember,
})

// --- Mock Data ---
const ROLES = [
    { key: 'USER', label: 'User (Standard)' },
    { key: 'ADMIN', label: 'Administrator' },
    { key: 'ACCOUNTING', label: 'Accounting' },
]

const DEPARTMENTS = [
    { key: 'd1', label: 'Design Team' },
    { key: 'd2', label: 'Development' },
    { key: 'd3', label: 'Marketing' },
    { key: 'd4', label: 'Finance' },
]

const JOB_TITLES = [
    { key: 'jt1', label: 'Frontend Developer' },
    { key: 'jt2', label: 'UI/UX Designer' },
    { key: 'jt3', label: 'Project Manager' },
    { key: 'jt4', label: 'Financial Analyst' },
]

const PENDING_INVITES = [
    {
        id: 1,
        email: 'jason.d@company.com',
        role: 'USER',
        department: 'Development',
        sentAt: '2 hours ago',
    },
    {
        id: 2,
        email: 'marta.k@company.com',
        role: 'ADMIN',
        department: 'Management',
        sentAt: '1 day ago',
    },
    {
        id: 3,
        email: 'new.hire@company.com',
        role: 'ACCOUNTING',
        department: 'Finance',
        sentAt: '3 days ago',
    },
]

function InviteMember() {
    const [selectedRole, setSelectedRole] = useState('USER')
    const [email, setEmail] = useState('')

    const handleSendInvite = () => {
        // Logic to call API: POST /invite
        console.log('Sending invite to:', email, 'Role:', selectedRole)
        // Reset form
        setEmail('')
    }

    return (
        <div className="p-8 max-w-300 mx-auto min-h-screen bg-slate-50 font-sans">
            {/* --- Page Header --- */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Invite Team Members
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Add new members to your workspace, assign roles, and set up
                    their initial profile.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- LEFT COLUMN: Invite Form --- */}
                <div className="lg:col-span-2">
                    <Card className="w-full" shadow="sm">
                        <CardBody className="p-6">
                            <Tabs
                                aria-label="Invite Options"
                                color="primary"
                                variant="underlined"
                                classNames={{
                                    tabList:
                                        'gap-6 w-full relative rounded-none p-0 border-b border-divider',
                                    cursor: 'w-full bg-primary',
                                    tab: 'max-w-fit px-0 h-12',
                                    tabContent:
                                        'group-data-[selected=true]:text-primary',
                                }}
                            >
                                {/* TAB 1: Email Invite */}
                                <Tab
                                    key="email"
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <Mail size={18} />
                                            <span>Invite by Email</span>
                                        </div>
                                    }
                                >
                                    <form className="flex flex-col gap-6 mt-6">
                                        {/* Email Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="colleague@company.com"
                                                startContent={
                                                    <Mail
                                                        className="text-slate-400"
                                                        size={18}
                                                    />
                                                }
                                                variant="bordered"
                                                value={email}
                                                onValueChange={setEmail}
                                                classNames={{
                                                    inputWrapper: 'bg-white',
                                                }}
                                            />
                                        </div>

                                        {/* Role & Access Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Assign Role
                                                </label>
                                                <Select
                                                    placeholder="Select a role"
                                                    startContent={
                                                        <Shield
                                                            className="text-slate-400"
                                                            size={18}
                                                        />
                                                    }
                                                    defaultSelectedKeys={[
                                                        'USER',
                                                    ]}
                                                    onChange={(e) =>
                                                        setSelectedRole(
                                                            e.target.value
                                                        )
                                                    }
                                                    variant="bordered"
                                                >
                                                    {ROLES.map((role) => (
                                                        <SelectItem
                                                            key={role.key}
                                                            textValue={
                                                                role.label
                                                            }
                                                        >
                                                            {role.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                                <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                                    *Admins have full access to
                                                    settings and billing.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Department
                                                </label>
                                                <Select
                                                    placeholder="Select department"
                                                    startContent={
                                                        <Building2
                                                            className="text-slate-400"
                                                            size={18}
                                                        />
                                                    }
                                                    variant="bordered"
                                                >
                                                    {DEPARTMENTS.map((dept) => (
                                                        <SelectItem
                                                            key={dept.key}
                                                            textValue={
                                                                dept.label
                                                            }
                                                        >
                                                            {dept.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    Job Title
                                                </label>
                                                <Select
                                                    placeholder="Select job title"
                                                    startContent={
                                                        <Briefcase
                                                            className="text-slate-400"
                                                            size={18}
                                                        />
                                                    }
                                                    variant="bordered"
                                                >
                                                    {JOB_TITLES.map((job) => (
                                                        <SelectItem
                                                            key={job.key}
                                                            textValue={
                                                                job.label
                                                            }
                                                        >
                                                            {job.label}
                                                        </SelectItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Personal Message (Optional)
                                            </label>
                                            <Textarea
                                                placeholder="Welcome to the team! We are excited to have you..."
                                                minRows={3}
                                                variant="bordered"
                                                classNames={{
                                                    inputWrapper: 'bg-white',
                                                }}
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button
                                                color="primary"
                                                endContent={<Send size={18} />}
                                                className="font-medium px-8"
                                                onPress={handleSendInvite}
                                            >
                                                Send Invitation
                                            </Button>
                                        </div>
                                    </form>
                                </Tab>

                                {/* TAB 2: Invite Link */}
                                <Tab
                                    key="link"
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <LinkIcon size={18} />
                                            <span>Get Invite Link</span>
                                        </div>
                                    }
                                >
                                    <div className="mt-6 space-y-6">
                                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                                            <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
                                                <UserPlus size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 text-sm">
                                                    Anyone with this link can
                                                    join
                                                </h4>
                                                <p className="text-blue-700 text-xs mt-1">
                                                    This link expires in 7 days.
                                                    Users joining via link will
                                                    be assigned the{' '}
                                                    <strong>User</strong> role
                                                    by default.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Share this link
                                            </label>
                                            <Snippet
                                                symbol=""
                                                className="w-full bg-slate-100 text-slate-600 border border-slate-200"
                                            >
                                                https://hiveq.com/invite/8a9f-4b21-9c3d
                                            </Snippet>
                                        </div>

                                        <Divider />

                                        <div className="flex justify-end">
                                            <Button
                                                variant="ghost"
                                                color="danger"
                                            >
                                                Reset Link
                                            </Button>
                                        </div>
                                    </div>
                                </Tab>
                            </Tabs>
                        </CardBody>
                    </Card>
                </div>

                {/* --- RIGHT COLUMN: Pending Invitations --- */}
                <div className="lg:col-span-1">
                    <Card className="w-full h-full bg-slate-50 border border-slate-200 shadow-none">
                        <CardHeader className="flex justify-between items-center px-6 pt-6">
                            <h3 className="font-bold text-slate-800 text-lg">
                                Pending Invites
                            </h3>
                            <Chip size="sm" variant="flat" color="warning">
                                3 Pending
                            </Chip>
                        </CardHeader>
                        <CardBody className="px-4">
                            <div className="space-y-3">
                                {PENDING_INVITES.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                name={invite.email[0].toUpperCase()}
                                                className="w-8 h-8 text-xs"
                                                color="default"
                                            />
                                            <div className="max-w-35">
                                                <p
                                                    className="text-sm font-bold text-slate-800 truncate"
                                                    title={invite.email}
                                                >
                                                    {invite.email}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                    <Clock size={10} />
                                                    <span>{invite.sentAt}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <Chip
                                                size="sm"
                                                className="h-5 text-[10px]"
                                                color="primary"
                                                variant="flat"
                                            >
                                                {invite.role}
                                            </Chip>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                className="w-6 h-6 text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Empty State visual if no invites (Optional logic) */}
                                {/* <div className="text-center py-8 text-slate-400 text-sm">No pending invitations</div> */}
                            </div>
                        </CardBody>
                        <CardFooter className="justify-center pb-6">
                            <Button
                                variant="light"
                                size="sm"
                                className="text-slate-500"
                            >
                                View All History
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
