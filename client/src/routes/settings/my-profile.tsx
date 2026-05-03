import SettingTitle from '@/features/settings/components/SettingTitle'
import { UploadAvatarModal } from '@/features/staff-directory'
import {
    dateFormatter,
    INTERNAL_URLS,
    optimizeCloudinary,
    phoneNumberFormatter,
    updateProfileSchema,
    useUpdateProfileMutation,
    useUploadImageMutation,
} from '@/lib'
import { profileOptions } from '@/lib/queries/options/user-queries'
import { HeroBreadcrumbItem, HeroBreadcrumbs } from '@/shared/components'
import {
    addToast,
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    useDisclosure,
} from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useFormik } from 'formik'
import {
    ALargeSmallIcon,
    Briefcase,
    Building,
    Calendar,
    Camera,
    House,
    Mail,
    Phone,
    Save,
    User,
} from 'lucide-react'
import { DisplayHelper } from '../../lib/helpers'

export const Route = createFileRoute('/settings/my-profile')({
    head: () => ({
        meta: [
            {
                title: 'My Profile',
            },
        ],
    }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(profileOptions())
    },
    component: SettingsProfilePage,
})

function SettingsProfilePage() {
    const {
        data: { profile },
        isLoading,
    } = useSuspenseQuery({
        ...profileOptions(),
    })

    const uploadImageMutation = useUploadImageMutation()
    const updateProfileMutation = useUpdateProfileMutation()

    const {
        isOpen: isOpenUploadAvatarModal,
        onOpen: onOpenUploadAvatarModal,
        onOpenChange: onCloseUploadAvatarModal,
    } = useDisclosure()

    const handleAvatarSave = async (imageFile: File) => {
        try {
            console.log('Uploading image...')
            const newAvatarUrl =
                await uploadImageMutation.mutateAsync(imageFile)

            if (!newAvatarUrl) throw new Error('Failed to get image URL')

            console.log('Updating user profile...', newAvatarUrl)
            await updateProfileMutation.mutateAsync({
                avatar: newAvatarUrl,
            })
        } catch (error) {
            console.error(error)
            addToast({
                title: 'Failed to update avatar',
                color: 'danger',
            })
        }
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            displayName: profile?.displayName || '',
            username: profile?.username || '',
            email: profile?.email || '',
            phoneNumber: phoneNumberFormatter(profile?.phoneNumber || '')
                .formatted,
            personalEmail: profile?.personalEmail || '',
        },
        validationSchema: updateProfileSchema,
        onSubmit: (values) => {
            updateProfileMutation.mutateAsync({
                displayName: values.displayName,
                phoneNumber: values.phoneNumber,
                personalEmail: values.personalEmail,
            })
        },
    })

    if (isLoading) return <div className="p-8">Loading profile...</div>

    return (
        <>
            <div className="mt-5">
                {/* Header */}
                <SettingTitle
                    title="My Profile"
                    description="Manage your personal information and public profile."
                />

                <div className="grid grid-cols-1 gap-8 mt-7 md:grid-cols-3">
                    {/* --- LEFT: Avatar & Identity Card --- */}
                    <div className="space-y-6 md:col-span-1">
                        <Card
                            shadow="none"
                            className="border border-border-default"
                        >
                            <CardBody className="flex flex-col items-center p-6 space-y-6 text-center">
                                {/* Avatar Trigger */}
                                <div>
                                    <div className="relative mb-4 group">
                                        <Avatar
                                            src={optimizeCloudinary(
                                                profile?.avatar,
                                                {
                                                    width: 512,
                                                    height: 512,
                                                }
                                            )}
                                            className="w-32 h-32 shadow-lg text-large ring-4 ring-offset-2 ring-slate-50"
                                        />
                                        <button
                                            onClick={onOpenUploadAvatarModal}
                                            className="absolute inset-0 bg-white/20 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                                        >
                                            <Camera
                                                className="mb-1 text-white"
                                                size={24}
                                            />
                                            <span className="text-xs font-bold text-white">
                                                Change
                                            </span>
                                        </button>
                                    </div>

                                    <h2 className="mt-1 text-xl font-bold text-text-default">
                                        {profile?.displayName}
                                    </h2>
                                    <p className="text-sm text-text-subdued mt-0.5 mb-4">
                                        @{profile?.username}
                                    </p>

                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        style={{
                                            ...DisplayHelper.getTagStyle(
                                                profile.role.hexColor
                                            ),
                                        }}
                                    >
                                        <span className="font-bold">
                                            {profile?.role?.displayName}
                                        </span>
                                    </Chip>
                                </div>

                                <Divider className="bg-border-default" />

                                <div className="w-full space-y-3 text-left">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-text-subdued">
                                            <Building size={14} /> Dept
                                        </span>
                                        <span className="font-medium text-text-default">
                                            {profile?.department?.displayName ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-text-subdued">
                                            <Briefcase size={14} /> Job title
                                        </span>
                                        <span className="font-medium text-text-default">
                                            {profile?.jobTitle?.displayName ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-text-subdued">
                                            <Calendar size={14} /> Joined at
                                        </span>
                                        <span className="font-medium text-text-default">
                                            {dateFormatter(profile?.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* --- RIGHT: Edit Form --- */}
                    <form
                        onSubmit={formik.handleSubmit}
                        className="md:col-span-2"
                    >
                        <Card
                            shadow="none"
                            className="border border-border-default"
                        >
                            <CardHeader className="px-6 py-4 border-b border-border-default">
                                <h3 className="text-lg font-bold text-text-default">
                                    Personal Details
                                </h3>
                            </CardHeader>
                            <CardBody className="gap-6 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Display Name */}
                                    <Input
                                        isRequired
                                        name="displayName"
                                        label="Display Name"
                                        labelPlacement="outside-top"
                                        placeholder="Your full name"
                                        variant="bordered"
                                        startContent={
                                            <ALargeSmallIcon
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        value={formik.values.displayName}
                                        onValueChange={(v) =>
                                            formik.setFieldValue(
                                                'displayName',
                                                v
                                            )
                                        }
                                        isInvalid={
                                            Boolean(
                                                formik.touched.displayName
                                            ) &&
                                            Boolean(formik.errors.displayName)
                                        }
                                        errorMessage={
                                            Boolean(
                                                formik.touched.displayName
                                            ) &&
                                            (formik.errors
                                                .displayName as string)
                                        }
                                    />

                                    {/* Username (Read-only) */}
                                    <Input
                                        label="Username"
                                        labelPlacement="outside-top"
                                        variant="flat"
                                        isReadOnly
                                        startContent={
                                            <User
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        value={formik.values.username}
                                        description="Contact admin to change username"
                                        className="opacity-70"
                                    />
                                    {/* 3. Personal Email (New Field) */}
                                    <Input
                                        name="personalEmail"
                                        label="Personal Email"
                                        labelPlacement="outside-top"
                                        placeholder="you@example.com"
                                        variant="bordered"
                                        value={formik.values.personalEmail}
                                        startContent={
                                            <Mail
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        onValueChange={(v) =>
                                            formik.setFieldValue(
                                                'personalEmail',
                                                v
                                            )
                                        }
                                        isInvalid={
                                            formik.touched.personalEmail &&
                                            !!formik.errors.personalEmail
                                        }
                                        errorMessage={
                                            formik.errors
                                                .personalEmail as string
                                        }
                                        description="Optional secondary email for notifications."
                                    />

                                    {/* Work Email (Read-only) */}
                                    <Input
                                        label="Work Email"
                                        labelPlacement="outside-top"
                                        variant="flat"
                                        isReadOnly
                                        startContent={
                                            <Mail
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        value={formik.values.email}
                                        description="Contact admin to change work email."
                                        className="opacity-70"
                                    />

                                    {/* Phone Number */}
                                    <Input
                                        name="phoneNumber"
                                        label="Phone Number"
                                        labelPlacement="outside-top"
                                        placeholder="0123 456 789"
                                        variant="bordered"
                                        value={formik.values.phoneNumber}
                                        startContent={
                                            <Phone
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        onValueChange={(v) =>
                                            formik.setFieldValue(
                                                'phoneNumber',
                                                v
                                            )
                                        }
                                        onBlur={() => {
                                            const result = phoneNumberFormatter(
                                                formik.values.phoneNumber,
                                                'VN'
                                            )
                                            if (result.formatted !== '-') {
                                                formik.setFieldValue(
                                                    'phoneNumber',
                                                    result.formatted
                                                )
                                            }
                                        }}
                                        isInvalid={
                                            formik.touched.phoneNumber &&
                                            !!formik.errors.phoneNumber
                                        }
                                        errorMessage={
                                            formik.errors.phoneNumber as string
                                        }
                                        description="Automatically converts 0 to +84 for Vietnam numbers"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        color="primary"
                                        onPress={() => formik.handleSubmit()}
                                        isDisabled={
                                            !formik.dirty ||
                                            !formik.isValid ||
                                            updateProfileMutation.isPending
                                        }
                                        isLoading={
                                            updateProfileMutation.isPending
                                        }
                                        startContent={
                                            !updateProfileMutation.isPending && (
                                                <Save size={18} />
                                            )
                                        }
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </form>
                </div>

                {/* --- AVATAR UPLOAD MODAL --- */}
                {isOpenUploadAvatarModal && (
                    <UploadAvatarModal
                        isOpen={isOpenUploadAvatarModal}
                        onClose={onCloseUploadAvatarModal}
                        onSave={handleAvatarSave}
                        currentAvatarUrl={optimizeCloudinary(profile.avatar, {
                            width: 256,
                            height: 256,
                        })}
                    />
                )}
            </div>
        </>
    )
}
