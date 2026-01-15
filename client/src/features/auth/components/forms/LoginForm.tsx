import { addToast, Button, Input } from '@heroui/react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useFormik } from 'formik'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { useLogin } from '@/lib/queries'
import { INTERNAL_URLS } from '@/lib/utils'
import { LoginInputSchema, type TLoginInput } from '@/lib/validationSchemas'
import { useDevice } from '@/shared/hooks'

export function LoginForm() {
    const navigate = useNavigate()

    const { isMobile, isTablet } = useDevice()

    const [isVisible, setIsVisible] = useState(false)
    const toggleVisibility = () => setIsVisible(!isVisible)

    const { mutateAsync: loginMutate, isPending: isLoggingIn } = useLogin()

    const formik = useFormik<TLoginInput>({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginInputSchema,
        onSubmit: async (values) => {
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
        },
    })

    return (
        <form
            onSubmit={formik.handleSubmit}
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
                <Input
                    isRequired
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    variant="bordered"
                    classNames={{
                        inputWrapper: '!shadow-SM',
                    }}
                    size={isMobile || isTablet ? 'sm' : undefined}
                    isInvalid={
                        Boolean(formik.touched.email) &&
                        Boolean(formik.errors.email)
                    }
                    errorMessage={
                        Boolean(formik.touched.email) && formik.errors.email
                    }
                />
                <Input
                    isRequired
                    id="password"
                    name="password"
                    label="Password"
                    type={isVisible ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
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
                    isInvalid={
                        Boolean(formik.touched.password) &&
                        Boolean(formik.errors.password)
                    }
                    errorMessage={
                        Boolean(formik.touched.password) &&
                        formik.errors.password
                    }
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
