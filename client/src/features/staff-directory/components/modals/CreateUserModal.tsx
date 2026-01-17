import { generatePassword } from '@/lib'
import {
    departmentsListOptions,
    jobTitlesListOptions,
    rolesListOptions,
} from '@/lib/queries'
import { useCreateUserMutation } from '@/lib/queries/useUser'
import { transformEmail } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/shared/components'
import { HeroCopyButton } from '@/shared/components/ui/hero-copy-button'
import { HeroInput } from '@/shared/components/ui/hero-input'
import { HeroModal, HeroModalContent } from '@/shared/components/ui/hero-modal'
import { HeroPasswordInput } from '@/shared/components/ui/hero-password-input'
import { HeroSelect, HeroSelectItem } from '@/shared/components/ui/hero-select'
import { useDevice } from '@/shared/hooks'
import { TDepartment, TJobTitle, TRole } from '@/shared/types'
import {
    addToast,
    Button,
    Checkbox,
    Divider,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Skeleton,
    Tab,
    Tabs,
    Tooltip,
} from '@heroui/react'
import { useSuspenseQueries } from '@tanstack/react-query'
import { FastField, FormikProvider, useFormik } from 'formik'
import {
    ArrowRightIcon,
    BriefcaseIcon,
    BuildingIcon,
    CheckCircle2Icon,
    ClipboardCheckIcon,
    KeyRoundIcon,
    MailIcon,
    MailsIcon,
    RefreshCwIcon,
    ShieldCheckIcon,
    UserIcon,
} from 'lucide-react'
import { Key, Suspense, useCallback, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

const ONLY_INTERNAL_EMAIL = false

// --- Schemas ---
const stepOneSchema = z.object({
    displayName: z
        .string('Full name is required')
        .min(2, 'Full name is too short'),
    email: z
        .string('Email is required')
        .min(1, 'Email is too short')
        .refine(
            (val) => {
                // Nếu ONLY_INTERNAL_EMAIL = false: Cho phép mọi email hợp lệ
                if (!ONLY_INTERNAL_EMAIL) return true

                // Nếu ONLY_INTERNAL_EMAIL = true: Bắt buộc phải kết thúc bằng @cadsquad.vn
                return val.toLowerCase().endsWith('@cadsquad.vn')
            },
            {
                message:
                    'Only @cadsquad.vn emails are allowed for internal staff',
            }
        ),
    personalEmail: z.string().email('Personal email is invalid').optional(),
    roleId: z.string().optional(),
})
const stepTwoSchema = z.object({
    departmentId: z.string().optional(),
    jobTitleId: z.string().optional(),
    password: z
        .string()
        .regex(/^.{8,}$/, {
            message: 'Password must be at least 8 characters long',
        })
        .optional()
        .or(z.literal('')),
})
const createUserSchema = stepOneSchema.merge(stepTwoSchema).extend({
    sendInviteEmail: z.boolean().default(true),
})
// Export type để sử dụng cho Formik
export type TCreateUserInput = z.infer<typeof createUserSchema>

type UserCreatedValues = {
    displayName: string
    password: string
    role?: TRole
    email: string
    personalEmail?: string
}
export default function CreateUserModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean
    onClose: () => void
}) {
    const { isDesktop } = useDevice()
    const createUserMutation = useCreateUserMutation()
    const [isSuccess, setIsSuccess] = useState(false)
    const [userCreated, setUserCreated] = useState<UserCreatedValues | null>(
        null
    )
    const onConfirm = async (values: TCreateUserInput) => {
        await createUserMutation.mutateAsync(values, {
            onSuccess(res) {
                setIsSuccess(true)
                setUserCreated({
                    displayName: values.displayName,
                    password: values.password ?? 'Secret value',
                    email: values.email,
                    role: res.role,
                    personalEmail: values.personalEmail,
                })
            },
        })
    }
    return (
        <HeroModal
            isOpen={isOpen}
            onClose={onClose}
            placement={isDesktop ? 'center' : 'bottom-center'}
            scrollBehavior="inside"
            classNames={{ base: 'max-w-[800px]' }}
        >
            <HeroModalContent>
                <ErrorBoundary
                    fallback={
                        <div className="p-10 text-center text-danger font-bold">
                            Initialization Failed
                        </div>
                    }
                >
                    <Suspense fallback={<CreateUserSkeleton />}>
                        {isOpen && !isSuccess ? (
                            <CreateUserFormContent
                                onClose={onClose}
                                onConfirm={onConfirm}
                            />
                        ) : (
                            <CreateUserSuccess
                                data={{
                                    displayName:
                                        userCreated?.displayName ??
                                        'Unknown user',
                                    email:
                                        userCreated?.email ??
                                        'unknown@cadsquad.vn',
                                    role: userCreated?.role ?? undefined,
                                    password:
                                        userCreated?.password ?? 'Secret value',
                                    personalEmail: userCreated?.personalEmail,
                                }}
                                onClose={() => {
                                    setIsSuccess(false)
                                    onClose()
                                }}
                            />
                        )}
                    </Suspense>
                </ErrorBoundary>
            </HeroModalContent>
        </HeroModal>
    )
}

const CreateUserFormContent = ({
    onClose,
    onConfirm,
}: {
    onClose: () => void
    onConfirm: (values: TCreateUserInput) => Promise<void>
}) => {
    const [step, setStep] = useState(1)
    const [isManualPassword, setIsManualPassword] = useState(false)
    const [generatedPwd, setGeneratedPwd] = useState(() => generatePassword())

    const [
        deptQuery,
        jobQuery,
        {
            data: { roles },
        },
    ] = useSuspenseQueries({
        queries: [
            { ...departmentsListOptions() },
            { ...jobTitlesListOptions() },
            { ...rolesListOptions() },
        ],
    })

    const departments = deptQuery.data.departments
    const jobTitles = jobQuery.data.jobTitles

    const formik = useFormik<TCreateUserInput>({
        initialValues: {
            displayName: '',
            email: '',
            personalEmail: '',
            roleId: '',
            departmentId: '',
            jobTitleId: '',
            password: '',
            sendInviteEmail: true,
        },
        validationSchema: toFormikValidationSchema(
            (step === 1 ? stepOneSchema : stepTwoSchema) as any
        ),
        onSubmit: async (values) => {
            const finalEmail = transformEmail(values.email)

            if (step === 1) {
                setStep(2)
                return
            }
            const finalPassword = isManualPassword
                ? values.password
                : generatedPwd
            await onConfirm({
                ...values,
                email: finalEmail,
                password: finalPassword,
            })
        },
    })

    const handleCopyGenerated = useCallback(() => {
        navigator.clipboard.writeText(generatedPwd)
        addToast({
            title: 'Password copied',
            color: 'primary',
            variant: 'flat',
        })
    }, [generatedPwd])

    const onTabChange = useCallback(
        (key: Key) => setIsManualPassword(key === 'manual'),
        []
    )

    return (
        <FormikProvider value={formik}>
            <ModalHeader className="flex flex-col gap-1 pt-6 px-8">
                <span className="text-xl font-bold tracking-tight text-text-default">
                    Create staff member
                </span>
                <div className="flex gap-2 mt-2">
                    <div
                        className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-default-200'}`}
                    />
                    <div
                        className={`h-1.5 w-12 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-default-200'}`}
                    />
                </div>
            </ModalHeader>

            <ModalBody className="p-0 overflow-x-hidden">
                <ScrollArea className="size-full h-[60vh]">
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                    <div className="px-4 pt-6 pb-14">
                        {step === 1 ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <p className="text-xs font-semibold text-text-subdued tracking-wider py-4">
                                    Step 1: Identity
                                </p>
                                <div className="space-y-6">
                                    <FastField name="displayName">
                                        {({ field, meta }: any) => (
                                            <HeroInput
                                                {...field}
                                                isRequired
                                                label="Full Name"
                                                placeholder="John Doe"
                                                variant="bordered"
                                                labelPlacement="outside-top"
                                                startContent={
                                                    <UserIcon
                                                        size={18}
                                                        className="text-text-subdued"
                                                    />
                                                }
                                                isInvalid={
                                                    meta.touched && !!meta.error
                                                }
                                                errorMessage={meta.error}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="email">
                                        {({ field, meta }: any) => (
                                            <HeroInput
                                                {...field}
                                                isRequired
                                                label="Email"
                                                placeholder="john.doe"
                                                variant="bordered"
                                                labelPlacement="outside-top"
                                                startContent={
                                                    <MailIcon
                                                        size={18}
                                                        className="text-text-subdued"
                                                    />
                                                }
                                                endContent={
                                                    <p className="text-xs font-semibold text-text-subdued">
                                                        @cadsquad.vn
                                                    </p>
                                                }
                                                isInvalid={
                                                    meta.touched && !!meta.error
                                                }
                                                errorMessage={meta.error}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="personalEmail">
                                        {({ field, meta }: any) => (
                                            <HeroInput
                                                {...field}
                                                label="Personal email (Optional)"
                                                placeholder="personal@example.com"
                                                variant="bordered"
                                                labelPlacement="outside-top"
                                                startContent={
                                                    <MailsIcon
                                                        size={18}
                                                        className="text-text-subdued"
                                                    />
                                                }
                                                isInvalid={
                                                    meta.touched && !!meta.error
                                                }
                                                errorMessage={meta.error}
                                            />
                                        )}
                                    </FastField>

                                    <FastField name="roleId">
                                        {({ field }: any) => (
                                            <HeroSelect
                                                label="System Role"
                                                labelPlacement="outside-top"
                                                placeholder="Select user system role"
                                                selectedKeys={[field.value]}
                                                disallowEmptySelection
                                                onSelectionChange={(keys) =>
                                                    formik.setFieldValue(
                                                        'roleId',
                                                        Array.from(keys)[0]
                                                    )
                                                }
                                            >
                                                {roles.map((r) => (
                                                    <HeroSelectItem
                                                        key={r.id}
                                                        textValue={
                                                            r.displayName
                                                        }
                                                    >
                                                        {r.displayName}
                                                    </HeroSelectItem>
                                                ))}
                                            </HeroSelect>
                                        )}
                                    </FastField>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-6">
                                <p className="text-xs font-semibold text-text-subdued tracking-wider py-4">
                                    Step 2: Organization & Security
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <FastField name="departmentId">
                                        {({ field, meta }: any) => (
                                            <HeroSelect
                                                label="Department"
                                                placeholder="Select staff department"
                                                labelPlacement="outside-top"
                                                selectedKeys={
                                                    field.value
                                                        ? [field.value]
                                                        : []
                                                }
                                                startContent={
                                                    <BuildingIcon
                                                        size={18}
                                                        className="text-text-subdued"
                                                    />
                                                }
                                                onSelectionChange={(keys) =>
                                                    formik.setFieldValue(
                                                        'departmentId',
                                                        Array.from(keys)[0]
                                                    )
                                                }
                                                isInvalid={
                                                    meta.touched && !!meta.error
                                                }
                                            >
                                                {departments.map(
                                                    (d: TDepartment) => (
                                                        <HeroSelectItem
                                                            key={d.id}
                                                        >
                                                            {d.displayName}
                                                        </HeroSelectItem>
                                                    )
                                                )}
                                            </HeroSelect>
                                        )}
                                    </FastField>

                                    <FastField name="jobTitleId">
                                        {({ field, meta }: any) => (
                                            <HeroSelect
                                                label="Job Title"
                                                labelPlacement="outside-top"
                                                placeholder="Select staff job title"
                                                selectedKeys={
                                                    field.value
                                                        ? [field.value]
                                                        : []
                                                }
                                                startContent={
                                                    <BriefcaseIcon
                                                        size={18}
                                                        className="text-text-subdued"
                                                    />
                                                }
                                                onSelectionChange={(keys) =>
                                                    formik.setFieldValue(
                                                        'jobTitleId',
                                                        Array.from(keys)[0]
                                                    )
                                                }
                                                isInvalid={
                                                    meta.touched && !!meta.error
                                                }
                                            >
                                                {jobTitles.map(
                                                    (j: TJobTitle) => (
                                                        <HeroSelectItem
                                                            key={j.id}
                                                        >
                                                            {j.displayName}
                                                        </HeroSelectItem>
                                                    )
                                                )}
                                            </HeroSelect>
                                        )}
                                    </FastField>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold">
                                            Security Credentials
                                        </span>
                                        <Tabs
                                            size="sm"
                                            variant="bordered"
                                            selectedKey={
                                                isManualPassword
                                                    ? 'manual'
                                                    : 'auto'
                                            }
                                            onSelectionChange={onTabChange}
                                        >
                                            <Tab
                                                key="auto"
                                                title="Auto-Generate"
                                                type="button"
                                            />
                                            <Tab
                                                key="manual"
                                                title="Manual Entry"
                                                type="button"
                                            />
                                        </Tabs>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-background-muted border border-border-default">
                                        {isManualPassword ? (
                                            <FastField name="password">
                                                {({ field, meta }: any) => (
                                                    <HeroPasswordInput
                                                        {...field}
                                                        label="Enter Password"
                                                        placeholder="Enter manual password"
                                                        variant="bordered"
                                                        isInvalid={
                                                            meta.touched &&
                                                            !!meta.error
                                                        }
                                                        errorMessage={
                                                            meta.error
                                                        }
                                                        startContent={
                                                            <KeyRoundIcon
                                                                size={16}
                                                                className="text-default-400"
                                                            />
                                                        }
                                                    />
                                                )}
                                            </FastField>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium text-text-subdued">
                                                        Generated Password
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            onPress={() =>
                                                                setGeneratedPwd(
                                                                    generatePassword()
                                                                )
                                                            }
                                                        >
                                                            <RefreshCwIcon
                                                                size={14}
                                                            />
                                                        </Button>
                                                        <Tooltip content="Copy Password">
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="flat"
                                                                onPress={
                                                                    handleCopyGenerated
                                                                }
                                                            >
                                                                <ClipboardCheckIcon
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                                <HeroInput
                                                    readOnly
                                                    value={generatedPwd}
                                                    variant="bordered"
                                                    className="text-center"
                                                    startContent={
                                                        <KeyRoundIcon
                                                            size={16}
                                                            className="text-default-400"
                                                        />
                                                    }
                                                />
                                            </div>
                                        )}

                                        <FastField name="sendInviteEmail">
                                            {({ field }: any) => (
                                                <Checkbox
                                                    className="mt-4"
                                                    isSelected={field.value}
                                                    onValueChange={(v) =>
                                                        formik.setFieldValue(
                                                            'sendInviteEmail',
                                                            v
                                                        )
                                                    }
                                                >
                                                    <span className="text-xs font-medium">
                                                        Send invitation email to
                                                        staff
                                                    </span>
                                                </Checkbox>
                                            )}
                                        </FastField>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </ModalBody>

            <Divider />
            <ModalFooter className="px-8 py-4">
                <Button
                    variant="light"
                    onPress={step === 1 ? onClose : () => setStep(1)}
                    isDisabled={formik.isSubmitting}
                >
                    {step === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button
                    color="primary"
                    onPress={() => formik.handleSubmit()}
                    isLoading={formik.isSubmitting}
                    className="font-bold px-8 shadow-lg"
                >
                    {step === 1 ? 'Next Step' : 'Create Staff Member'}
                </Button>
            </ModalFooter>
        </FormikProvider>
    )
}

export const CreateUserSkeleton = () => (
    <div className="p-8 space-y-8 animate-pulse">
        <Skeleton className="w-1/3 h-6 rounded-lg" />
        <div className="space-y-6">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
        </div>
    </div>
)
interface CreateUserSuccessProps {
    data: UserCreatedValues
    onClose: () => void
}
export const CreateUserSuccess = ({
    data,
    onClose,
}: CreateUserSuccessProps) => {
    const handleCopyAll = () => {
        const text = `Email: ${data.email}\nPassword: ${data.password}`
        navigator.clipboard.writeText(text)
        addToast({
            title: 'Copied to clipboard',
            color: 'success',
            variant: 'flat',
        })
    }

    return (
        <div className="flex flex-col items-center py-6 animate-in fade-in zoom-in-95 duration-400">
            {/* Success Icon Animation */}
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-success-100 animate-ping opacity-25" />
                <div className="relative p-4 rounded-full bg-success-50 text-success shadow-sm">
                    <CheckCircle2Icon size={48} />
                </div>
            </div>

            <h3 className="text-xl font-bold text-text-default">
                Staff Member Created!
            </h3>
            <p className="text-sm text-text-subdued mt-1 mb-8 text-center px-6">
                The account for{' '}
                <span className="font-semibold text-primary">
                    {data.displayName}
                </span>{' '}
                is now active and ready for use.
            </p>

            {/* Account Summary Card */}
            <div className="w-full max-w-sm p-5 rounded-2xl bg-content2 border border-divider space-y-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-divider shadow-sm">
                        <UserIcon size={16} className="text-text-subdued" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-text-subdued tracking-tight">
                            Full Name
                        </p>
                        <p className="text-sm font-bold truncate">
                            {data.displayName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-divider shadow-sm">
                        <MailIcon size={16} className="text-text-subdued" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-text-subdued tracking-tight">
                            Work Email
                        </p>
                        <p className="text-sm font-bold truncate">
                            {data.email}
                        </p>
                    </div>
                </div>

                {data.personalEmail && (
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-divider shadow-sm">
                            <MailsIcon
                                size={16}
                                className="text-text-subdued"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] uppercase font-black text-text-subdued tracking-tight">
                                Personal Email
                            </p>
                            <p className="text-sm font-bold truncate">
                                {data.personalEmail}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-white flex items-center justify-center border border-divider shadow-sm">
                        <ShieldCheckIcon
                            size={16}
                            className="text-text-subdued"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-black text-text-subdued tracking-tight">
                            System Role
                        </p>
                        <p className="text-sm font-bold">
                            {data?.role?.displayName}
                        </p>
                    </div>
                </div>

                {data.password && (
                    <>
                        <Divider className="opacity-50" />
                        <div className="flex items-center justify-between group">
                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase font-black text-warning-600 tracking-tight">
                                    Temporary Password
                                </p>
                                <p className="text-sm font-mono font-bold tracking-wider">
                                    {data.password}
                                </p>
                            </div>
                            <Tooltip content="Copy password">
                                <HeroCopyButton textValue={data.password} />
                            </Tooltip>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-8 flex gap-3 w-full px-8">
                <Button
                    fullWidth
                    variant="flat"
                    className="font-bold"
                    onPress={handleCopyAll}
                >
                    Copy Credentials
                </Button>
                <Button
                    fullWidth
                    color="primary"
                    className="font-bold shadow-lg shadow-primary/20"
                    onPress={onClose}
                    endContent={<ArrowRightIcon size={16} />}
                >
                    Done
                </Button>
            </div>
        </div>
    )
}
