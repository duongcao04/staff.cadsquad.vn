import { addToast, Button, Input } from '@heroui/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/presentation/lib/queries'
import { INTERNAL_URLS } from '@/presentation/lib/utils'
import { useDevice } from '@/presentation/hooks'
import {
    LoginSchema,
    TLoginFormValues,
} from '../../_validation-schemas/login-input.schema'

export function LoginForm() {
    const navigate = useNavigate()

    const { isMobile, isTablet } = useDevice()

    const [isVisible, setIsVisible] = useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)

    const { mutateAsync: loginMutate, isPending: isLoggingIn } = useLogin()

    const { handleSubmit, control } = useForm<TLoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (values: TLoginFormValues) => {
        await loginMutate(
            {
                email: values.email,
                password: values.password,
            },
            {
                async onSuccess(res) {
                    addToast({ title: res.data.message, color: 'success' })
                    navigate({
                        href: '/',
                    })
                },
            }
        )
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="min-w-[90%] lg:min-w-150 shadow-SM rounded-lg px-8 py-6 lg:py-8 lg:px-16 bg-background-muted space-y-1"
        >
            <h1 className="text-lg lg:text-2xl font-bold text-center lg:text-left font-saira">
                Sign in
            </h1>
            <p className="text-center lg:text-left text-sm! lg:text-base">
                Login to continue to
                <Link
                    to={INTERNAL_URLS.home}
                    className="pl-1 text-blue-500! hover:underline underline-offset-2"
                >
                    staff.cadsquad.vn
                </Link>
            </p>
            <div className="mt-5 space-y-5">
                <Controller
                    name="email"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            {...field}
                            isRequired
                            id="email"
                            label="Email"
                            variant="bordered"
                            classNames={{
                                inputWrapper: '!shadow-SM',
                            }}
                            size={isMobile || isTablet ? 'sm' : undefined}
                            isInvalid={!!error}
                            errorMessage={error?.message}
                        />
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                        <Input
                            {...field}
                            isRequired
                            id="password"
                            label="Password"
                            type={isVisible ? 'text' : 'password'}
                            variant="bordered"
                            classNames={{
                                inputWrapper: '!shadow-SM',
                            }}
                            size={isMobile || isTablet ? 'sm' : 'md'}
                            endContent={
                                <Button
                                    isIconOnly
                                    onPress={toggleVisibility}
                                    variant="light"
                                >
                                    {isVisible ? <Eye /> : <EyeOff />}
                                </Button>
                            }
                            isInvalid={!!error}
                            errorMessage={error?.message}
                        />
                    )}
                />
                <p className="ml-1 text-center lg:text-left text-sm! lg:text-base">
                    You need support? Contact to:
                    <a
                        href={'mailto:ch.duong@cadsquad.vn'}
                        className="pl-1 text-blue-500! hover:underline underline-offset-2"
                    >
                        Ch.duong@cadsquad.vn
                    </a>
                </p>
                <div className="mt-5 lg:mt-10 w-[80%] mx-auto grid place-items-center">
                    <Button
                        color="danger"
                        className="w-full rounded-sm"
                        type="submit"
                        isLoading={isLoggingIn}
                    >
                        Login
                    </Button>
                </div>
            </div>
        </form>
    )
}
