import {
    dateFormatter,
    getPageTitle,
    INTERNAL_URLS,
    optimizeCloudinary,
    phoneNumberFormatter,
    updateProfileSchema,
    useUpdateProfileMutation,
    useUploadImageMutation,
} from '@/lib'
import { profileOptions } from '@/lib/queries/options/user-queries'
import {
    HeroBreadcrumbItem,
    HeroBreadcrumbs,
    HeroCard,
    HeroCardBody,
    HeroCardHeader,
} from '@/shared/components'
import {
    addToast,
    Avatar,
    Button,
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
import SettingTitle from '../../features/settings/components/SettingTitle'
import { UploadAvatarModal } from '../../features/staff-directory'

export const Route = createFileRoute('/settings/my-profile')({
    head: () => ({
        meta: [
            {
                title: getPageTitle('My Profile'),
            },
        ],
    }),
    loader: ({ context }) => {
        return context.queryClient.ensureQueryData(profileOptions())
    },
    component: SettingsProfilePage,
})

function SettingsProfilePage() {
    const { data: user, isLoading } = useSuspenseQuery({
        ...profileOptions(),
    })

    const uploadImageMutation = useUploadImageMutation()
    const updateProfileMutation = useUpdateProfileMutation()

    // Avatar Modal State
    const {
        isOpen: isOpenUploadAvatarModal,
        onOpen: onOpenUploadAvatarModal,
        onOpenChange: onCloseUploadAvatarModal,
    } = useDisclosure()

    const handleAvatarSave = async (imageFile: File) => {
        try {
            // Step 1: Upload the file to get the URL
            console.log('Uploading image...')
            const newAvatarUrl =
                await uploadImageMutation.mutateAsync(imageFile)

            if (!newAvatarUrl) throw new Error('Failed to get image URL')

            // Step 2: Update the user record with this URL
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
            displayName: user?.displayName || '',
            username: user?.username || '',
            email: user?.email || '', // Sử dụng formatter để hiển thị số điện thoại quốc tế (ví dụ: +84 862...)
            phoneNumber: phoneNumberFormatter(user?.phoneNumber || '')
                .formatted,
        },
        // We reuse the schema but might want to omit role/active checks for self-update
        validationSchema: updateProfileSchema,
        onSubmit: (values) => {
            updateProfileMutation.mutateAsync({
                displayName: values.displayName,
                phoneNumber: values.phoneNumber,
            })
        },
    })

    if (isLoading) return <div className="p-8">Loading profile...</div>

    return (
        <>
            <HeroBreadcrumbs className="text-xs">
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.home}
                        className="text-text-subdued!"
                    >
                        <House size={16} />
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>
                    <Link
                        to={INTERNAL_URLS.settings}
                        className="text-text-subdued!"
                    >
                        Settings
                    </Link>
                </HeroBreadcrumbItem>
                <HeroBreadcrumbItem>My Profile</HeroBreadcrumbItem>
            </HeroBreadcrumbs>

            <div className="mt-5">
                {/* Header */}
                <SettingTitle
                    title="My Profile"
                    description="Manage your personal information and public profile."
                />

                <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* --- LEFT: Avatar & Identity Card --- */}
                    <div className="md:col-span-1 space-y-6">
                        <HeroCard>
                            <HeroCardBody className="flex flex-col items-center text-center p-6">
                                {/* Avatar Trigger */}
                                <div className="relative group mb-4">
                                    <Avatar
                                        src={optimizeCloudinary(user?.avatar, {
                                            width: 512,
                                            height: 512,
                                        })}
                                        className="w-32 h-32 text-large ring-4 ring-offset-2 ring-slate-50 shadow-lg"
                                    />
                                    <button
                                        onClick={onOpenUploadAvatarModal}
                                        className="absolute inset-0 bg-white/20 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                                    >
                                        <Camera
                                            className="text-white mb-1"
                                            size={24}
                                        />
                                        <span className="text-white text-xs font-bold">
                                            Change
                                        </span>
                                    </button>
                                </div>

                                <h2 className="mt-1 text-xl font-bold text-text-default">
                                    {user?.displayName}
                                </h2>
                                <p className="text-sm text-text-subdued mt-0.5 mb-4">
                                    @{user?.username}
                                </p>

                                <Chip
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    className="mb-6"
                                >
                                    {user?.role.displayName}
                                </Chip>

                                <Divider className="my-3" />
                                <div className="w-full space-y-3 text-left">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-subdued flex items-center gap-2">
                                            <Building size={14} /> Dept
                                        </span>
                                        <span className="font-semibold text-text-default">
                                            {user?.department?.displayName ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-subdued flex items-center gap-2">
                                            <Briefcase size={14} /> Title
                                        </span>
                                        <span className="font-semibold text-text-default">
                                            {user?.jobTitle?.displayName ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-subdued flex items-center gap-2">
                                            <Calendar size={14} /> Joined
                                        </span>
                                        <span className="font-semibold text-text-default">
                                            {dateFormatter(user?.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </HeroCardBody>
                        </HeroCard>
                    </div>

                    {/* --- RIGHT: Edit Form --- */}
                    <form
                        onSubmit={formik.handleSubmit}
                        className="md:col-span-2"
                    >
                        <HeroCard>
                            <HeroCardHeader className="px-6 py-4 border-b border-border-default">
                                <h3 className="font-bold text-text-default text-lg">
                                    Personal Details
                                </h3>
                            </HeroCardHeader>
                            <HeroCardBody className="p-6 gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        // Khi rời khỏi ô nhập liệu, tự động chuyển 0 -> +84
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
                                    <Input
                                        label="Email"
                                        labelPlacement="outside"
                                        variant="flat"
                                        isReadOnly
                                        startContent={
                                            <Mail
                                                size={16}
                                                className="text-text-subdued"
                                            />
                                        }
                                        value={formik.values.email}
                                        description="Contact admin to change email."
                                        className="opacity-70"
                                    />
                                    <Input
                                        label="Username"
                                        labelPlacement="outside"
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
                            </HeroCardBody>
                        </HeroCard>
                    </form>
                </div>

                {/* --- AVATAR UPLOAD MODAL --- */}
                {isOpenUploadAvatarModal && (
                    <UploadAvatarModal
                        isOpen={isOpenUploadAvatarModal}
                        onClose={onCloseUploadAvatarModal}
                        onSave={handleAvatarSave}
                        currentAvatarUrl={optimizeCloudinary(user.avatar, {
                            width: 256,
                            height: 256,
                        })}
                    />
                )}
            </div>
        </>
    )
}
