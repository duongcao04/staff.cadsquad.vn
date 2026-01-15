import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    Checkbox,
    CheckboxGroup,
    Divider,
    Input,
    Skeleton,
} from '@heroui/react'
import { useFormik } from 'formik'
import { ListChecks, Palette, ShieldCheck } from 'lucide-react'
import { createRoleSchema } from '../../../../lib/validationSchemas'
import { TGroupPermission } from '../../../../shared/types/_role.type'
import {
    HeroModal,
    HeroModalBody,
    HeroModalContent,
    HeroModalFooter,
    HeroModalHeader,
} from '../../../../shared/components/ui/hero-modal'
import { ScrollArea, ScrollBar } from '../../../../shared/components/ui/scroll-area'
import { useCreateRoleMutation } from '../../../../lib/queries/useRole'

type CreateRoleModalProps = {
    isOpen: boolean
    onClose: () => void
    allPermissions: TGroupPermission[]
    isLoading?: boolean
    onSave?: (payload: {
        displayName: string
        hexColor: string
        permissionIds: string[]
    }) => void
}

export default function CreateRoleModal({
    isOpen,
    onClose,
    allPermissions,
    isLoading = false,
    onSave,
}: CreateRoleModalProps) {
    const createRoleMutation = useCreateRoleMutation()
    // 2. Initialize Formik
    const formik = useFormik({
        initialValues: {
            displayName: '',
            hexColor: '#3b82f6',
            permissionIds: [] as string[],
        },
        validationSchema: createRoleSchema,
        onSubmit: async (values) => {
            if (onSave) {
                onSave(values)
            } else {
                console.log(values)

                createRoleMutation.mutateAsync(values, {
                    onSuccess: () => {
                        formik.resetForm()
                        onClose()
                    },
                })
            }
        },
    })

    const handleClose = () => {
        formik.resetForm()
        onClose()
    }

    return (
        <HeroModal isOpen={isOpen} onClose={handleClose} size="2xl">
            <HeroModalContent>
                {() => (
                    <form onSubmit={formik.handleSubmit}>
                        <HeroModalHeader className="flex flex-col gap-1 pt-8">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <ShieldCheck
                                    className="text-primary"
                                    size={28}
                                />
                                Configure Role
                            </h2>
                            <p className="text-xs text-default-500 font-medium">
                                Define identity and access levels for the
                                system.
                            </p>
                        </HeroModalHeader>

                        <HeroModalBody className="pb-8 px-0">
                            <ScrollArea className="h-125 px-6">
                                <ScrollBar orientation="vertical" />

                                {/* Role Identity Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 mt-2">
                                    <Input
                                        isRequired
                                        name="displayName"
                                        label="Role Display Name"
                                        placeholder="e.g. Senior Moderator"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        isInvalid={
                                            !!formik.errors.displayName &&
                                            formik.touched.displayName
                                        }
                                        errorMessage={formik.errors.displayName}
                                        classNames={{
                                            label: 'font-bold text-default-700',
                                        }}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-default-700">
                                            Role Color Identity
                                        </label>
                                        <div
                                            className={`grid grid-cols-[24px_1fr_44px] w-full items-center gap-3 h-12 px-4 border-2 rounded-2xl transition-colors ${!!formik.errors.hexColor ? 'border-danger' : 'border-border-default hover:border-primary'}`}
                                        >
                                            <Palette
                                                size={18}
                                                className="text-default-400"
                                            />
                                            <span className="text-sm font-mono font-bold uppercase tracking-wider">
                                                {formik.values.hexColor}
                                            </span>
                                            <input
                                                name="hexColor"
                                                type="color"
                                                value={formik.values.hexColor}
                                                onChange={formik.handleChange}
                                                className="w-8 h-8 rounded-full cursor-pointer border-none bg-transparent"
                                            />
                                        </div>
                                        {formik.errors.hexColor && (
                                            <span className="text-tiny text-danger ml-1">
                                                {formik.errors.hexColor}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-default-400">
                                        Authority Matrix
                                    </h3>
                                    {!isLoading && (
                                        <span
                                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${formik.errors.permissionIds ? 'bg-danger-100 text-danger' : 'bg-default-100'}`}
                                        >
                                            {formik.values.permissionIds.length}{' '}
                                            Active Rights
                                        </span>
                                    )}
                                </div>

                                <Divider className="mb-6" />

                                {isLoading ? (
                                    <PermissionAccordionSkeleton />
                                ) : (
                                    <>
                                        <Accordion
                                            variant="splitted"
                                            selectionMode="multiple"
                                            className="px-0 cursor-pointer"
                                            defaultExpandedKeys={
                                                allPermissions.length > 0
                                                    ? [allPermissions[0].id]
                                                    : []
                                            }
                                        >
                                            {allPermissions.map((group) => (
                                                <AccordionItem
                                                    key={group.id}
                                                    aria-label={group.name}
                                                    startContent={
                                                        <ListChecks
                                                            size={20}
                                                            className="text-primary"
                                                        />
                                                    }
                                                    title={
                                                        <span className="font-black text-sm uppercase tracking-tight">
                                                            {group.name}
                                                        </span>
                                                    }
                                                    subtitle={
                                                        <span className="text-xs text-default-400">
                                                            {
                                                                group
                                                                    .permissions
                                                                    .length
                                                            }{' '}
                                                            actions available
                                                        </span>
                                                    }
                                                    classNames={{
                                                        base: 'border border-border-default shadow-none mb-3 px-2',
                                                        title: 'leading-none',
                                                    }}
                                                >
                                                    <CheckboxGroup
                                                        name="permissionIds"
                                                        value={
                                                            formik.values
                                                                .permissionIds
                                                        }
                                                        onValueChange={(vals) =>
                                                            formik.setFieldValue(
                                                                'permissionIds',
                                                                vals
                                                            )
                                                        }
                                                        color="primary"
                                                        size="sm"
                                                    >
                                                        <div className="grid grid-cols-2 gap-y-4 gap-x-4 py-3">
                                                            {group.permissions.map(
                                                                (perm) => (
                                                                    <Checkbox
                                                                        key={
                                                                            perm.id
                                                                        }
                                                                        value={
                                                                            perm.id
                                                                        }
                                                                        classNames={{
                                                                            label: 'text-xs font-semibold text-default-700',
                                                                        }}
                                                                    >
                                                                        {
                                                                            perm.displayName
                                                                        }
                                                                    </Checkbox>
                                                                )
                                                            )}
                                                        </div>
                                                    </CheckboxGroup>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                        {formik.errors.permissionIds &&
                                            formik.touched.permissionIds && (
                                                <p className="text-tiny text-danger mt-2 ml-1">
                                                    {
                                                        formik.errors
                                                            .permissionIds
                                                    }
                                                </p>
                                            )}
                                    </>
                                )}
                            </ScrollArea>
                        </HeroModalBody>

                        <HeroModalFooter className="border-t border-border-default bg-default-50/50 p-6">
                            <Button
                                variant="light"
                                onPress={handleClose}
                                className="font-bold text-default-500"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                className="font-bold shadow-xl shadow-primary/30 px-10 h-12"
                                isLoading={
                                    createRoleMutation.isPending ||
                                    formik.isSubmitting ||
                                    isLoading
                                }
                                isDisabled={
                                    createRoleMutation.isPending ||
                                    !formik.isValid ||
                                    !formik.dirty
                                }
                            >
                                Save Role Configuration
                            </Button>
                        </HeroModalFooter>
                    </form>
                )}
            </HeroModalContent>
        </HeroModal>
    )
}

export const PermissionAccordionSkeleton = () => (
    <div className="space-y-3 w-full">
        {[1, 2, 3, 4].map((i) => (
            <Card
                key={i}
                className="p-4 border border-border-default shadow-none rounded-2xl"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col gap-2 w-full">
                        <Skeleton className="h-5 w-1/3 rounded-lg" />
                        <Skeleton className="h-3 w-1/2 rounded-lg" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                </div>
            </Card>
        ))}
    </div>
)
