import { addToast, Button, type InputProps, Textarea } from '@heroui/react'
import { Image, Modal } from 'antd'
import { useFormik } from 'formik'
import { capitalize } from 'lodash'
import { useMemo } from 'react'

import {
    useProfile,
    useSendNotificationMutation,
    useUsers,
} from '@/lib/queries'
import {
    CreateNotificationInputSchema,
    type TCreateNotificationInput,
} from '@/lib/validationSchemas'
import { NotificationTypeEnum } from '@/shared/enums'

import { HeroInput } from '../../../../shared/components/ui/hero-input'
import { HeroSelect, HeroSelectItem } from '../../../../shared/components/ui/hero-select'

const inputClassNames: InputProps['classNames'] = {
    base: 'grid grid-cols-[140px_1fr] gap-3',
    inputWrapper:
        'w-full border-[1px] bg-background shadow-none !placeholder:italic',
    label: 'text-right font-medium text-base',
}

type Props = {
    isOpen: boolean
    onClose: () => void
}
export function CreateNotificationModal({ isOpen, onClose }: Props) {
    const { data: users, isLoading: loadingUsers } = useUsers()
    const { profile } = useProfile()

    const { isPending: isSendingNotification } = useSendNotificationMutation()

    const notificationTypeEnumList = Object.entries(NotificationTypeEnum).map(
        (i) => {
            return {
                ...i,
                label: capitalize(i[1].toLowerCase().replaceAll('_', ' ')),
                value: i[0],
            }
        }
    )

    const initialValues = useMemo<TCreateNotificationInput>(
        () => ({
            content: '',
            type: NotificationTypeEnum.INFO,
            userIds: [],
            senderId: profile?.id ?? '',
            title: '',
            imageUrl: '',
        }),
        [profile?.id]
    )

    const formik = useFormik<TCreateNotificationInput>({
        initialValues,
        validationSchema: CreateNotificationInputSchema,
        onSubmit: async (values) => {
            try {
                if (values.userIds?.length) {
                    // map các userId thành mảng promise
                    const sendAll = values.userIds.map(() => {
                        // sendNotificationMutate(message)
                    })

                    // chờ tất cả promise hoàn thành
                    await Promise.all(sendAll)
                }
            } catch (error) {
                addToast({
                    title: 'Send notification failed!',
                    description: `${error}`,
                    color: 'danger',
                })
            }
        },
    })

    return (
        <form onSubmit={formik.handleSubmit}>
            <Modal
                open={isOpen}
                onCancel={onClose}
                title={<p className="text-lg capitalize">Send notification</p>}
                width={{
                    xs: '90%',
                    sm: '80%',
                    md: '70%',
                    lg: '60%',
                    xl: '50%',
                    xxl: '50%',
                }}
                style={{ top: 50 }}
                classNames={{
                    mask: 'backdrop-blur-sm',
                }}
                footer={() => {
                    return (
                        <div className="flex items-center justify-end gap-4">
                            <Button
                                variant="light"
                                color="primary"
                                className="px-14"
                                onPress={() => {
                                    onClose()
                                    formik.resetForm()
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                isLoading={isSendingNotification}
                                color="primary"
                                className="px-16"
                                onPress={() => {
                                    formik.handleSubmit()
                                }}
                                type="submit"
                            >
                                Create
                            </Button>
                        </div>
                    )
                }}
            >
                <div className="py-8 space-y-4 border-t border-border">
                    <HeroInput
                        isRequired
                        autoFocus
                        id="title"
                        name="title"
                        label="Title"
                        placeholder="e.g. Sample notification for sample issue"
                        color="primary"
                        variant="faded"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        labelPlacement="outside-left"
                        classNames={inputClassNames}
                        isInvalid={
                            Boolean(formik.touched.title) &&
                            Boolean(formik.errors.title)
                        }
                        errorMessage={
                            Boolean(formik.touched.title) && formik.errors.title
                        }
                        size="md"
                    />

                    <div className="grid grid-cols-[140px_1fr] gap-3 items-center">
                        <p
                            className={`relative text-right font-medium text-base pr-2 ${
                                Boolean(formik.touched.userIds) &&
                                formik.errors.userIds
                                    ? 'text-danger'
                                    : 'text-primary'
                            }`}
                        >
                            Receivers
                            <span className="absolute top-0 right-0 text-danger!">
                                *
                            </span>
                        </p>
                        <HeroSelect
                            isLoading={loadingUsers}
                            id="userIds"
                            name="userIds"
                            placeholder="Select one or more receiver"
                            size="md"
                            selectionMode="multiple"
                            selectedKeys={formik.values.userIds}
                            onChange={(e) => {
                                const value = e.target.value
                                const valueArr = value
                                    .split(',')
                                    .filter((i) => i !== '')

                                formik.setFieldValue('userIds', valueArr)
                                formik.setFieldTouched('userIds', true, false)
                            }}
                            classNames={{
                                base: 'overflow-hidden',
                            }}
                            renderValue={(selectedItems) => {
                                return (
                                    <ul className="flex line-clamp-1 truncate">
                                        {selectedItems.map((user) => {
                                            const item = users?.find(
                                                (d) => d.id === user.key
                                            )
                                            if (!item)
                                                return (
                                                    <span
                                                        className="text-gray-400"
                                                        key={user.key}
                                                    >
                                                        Select one department
                                                    </span>
                                                )
                                            return (
                                                <p key={user.key}>
                                                    {item.displayName}
                                                    {item.id !==
                                                        selectedItems[
                                                            selectedItems.length -
                                                                1
                                                        ].key && (
                                                        <span className="pr-1">
                                                            ,
                                                        </span>
                                                    )}
                                                </p>
                                            )
                                        })}
                                    </ul>
                                )
                            }}
                        >
                            {users?.map((usr) => {
                                const departmentColor = usr.department
                                    ? usr.department?.hexColor
                                    : 'transparent'
                                return (
                                    <HeroSelectItem key={usr.id}>
                                        <div className="flex items-center justify-start gap-4">
                                            <div className="size-9">
                                                <Image
                                                    src={usr.avatar as string}
                                                    alt="user avatar"
                                                    rootClassName="!size-10 rounded-full"
                                                    className="size-full! rounded-full p-px border-2"
                                                    preview={false}
                                                    style={{
                                                        borderColor:
                                                            departmentColor,
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-normal">
                                                    {usr.displayName}
                                                </p>
                                                <p className="text-text-muted">
                                                    {usr.email}
                                                </p>
                                            </div>
                                        </div>
                                    </HeroSelectItem>
                                )
                            })}
                        </HeroSelect>
                    </div>

                    <div className="w-full grid grid-cols-[140px_1fr] gap-3 items-center">
                        <p
                            className={`relative text-right font-medium text-base pr-2 ${
                                Boolean(formik.touched.type) &&
                                formik.errors.type
                                    ? 'text-danger'
                                    : 'text-primary'
                            }`}
                        >
                            Select type
                            <span className="absolute top-0 right-0 text-danger!">
                                *
                            </span>
                        </p>
                        <div className="flex flex-col w-full">
                            <HeroSelect
                                id="type"
                                name="type"
                                placeholder="Select role permission for this user"
                                size="md"
                                selectedKeys={[formik.values.type]}
                                onChange={(e) => {
                                    const value = e.target.value
                                    formik.setFieldValue('type', value)
                                    formik.setFieldTouched('type', true, false)
                                }}
                            >
                                {notificationTypeEnumList?.map((type) => (
                                    <HeroSelectItem key={type.value}>
                                        {type.label}
                                    </HeroSelectItem>
                                ))}
                            </HeroSelect>
                            {Boolean(formik.touched.type) &&
                                Boolean(formik.errors.type) && (
                                    <p className="mt-1 text-xs text-danger">
                                        {formik.errors.type}
                                    </p>
                                )}
                        </div>
                    </div>

                    <Textarea
                        isRequired
                        id="content"
                        name="content"
                        label="Message"
                        placeholder="Enter message here ..."
                        color="primary"
                        variant="faded"
                        value={formik.values.content}
                        onChange={formik.handleChange}
                        labelPlacement="outside-left"
                        classNames={{
                            base: 'grid grid-cols-[140px_1fr] gap-3 items-start',
                            inputWrapper:
                                'w-full border-[1px] bg-background shadow-none !placeholder:italic',
                            label: 'pt-3 text-right font-medium text-base',
                        }}
                        isInvalid={
                            Boolean(formik.touched.content) &&
                            Boolean(formik.errors.content)
                        }
                        errorMessage={
                            Boolean(formik.touched.content) &&
                            formik.errors.content
                        }
                        size="lg"
                    />
                </div>
            </Modal>
        </form>
    )
}
