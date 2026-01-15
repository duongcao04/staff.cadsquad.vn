import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Progress,
    Spinner,
} from '@heroui/react'
import { Icon } from '@iconify/react'

interface VerifyingAccessProps {
    status: 'loading' | 'success' | 'error'
    progress: number
    message: string
    onRetry?: () => void
    onCancel?: () => void
}

export default function VerifyingAccessScreen({
    status,
    progress,
    message,
    onRetry,
    onCancel,
}: VerifyingAccessProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-content1/50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-md border-none bg-background/60 shadow-2xl backdrop-blur-md">
                <CardBody className="flex flex-col items-center justify-center gap-6 py-12 text-center">
                    {/* --- ICON --- */}
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-default-100">
                        {status === 'loading' && (
                            <>
                                <Spinner
                                    size="lg"
                                    color="primary"
                                    classNames={{
                                        wrapper: 'h-24 w-24 absolute inset-0',
                                    }}
                                />
                                <Icon
                                    icon="solar:shield-keyhole-bold-duotone"
                                    className="text-4xl text-default-500"
                                />
                            </>
                        )}

                        {status === 'success' && (
                            <div className="animate-appearance-in">
                                <Icon
                                    icon="solar:check-circle-bold"
                                    className="text-6xl text-success"
                                />
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="animate-appearance-in">
                                <Icon
                                    icon="solar:close-circle-bold"
                                    className="text-6xl text-danger"
                                />
                            </div>
                        )}
                    </div>

                    {/* --- TEXT CONTENT --- */}
                    <div className="space-y-2 px-4">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {status === 'loading' && 'Verifying Access'}
                            {status === 'success' && 'Access Granted'}
                            {status === 'error' && 'Access Denied'}
                        </h1>
                        <p className="text-sm text-default-500">{message}</p>
                    </div>

                    {/* --- PROGRESS BAR --- */}
                    {/* Always render closely to prevent layout shift, or just hide opacity */}
                    <div
                        className={`w-full max-w-xs space-y-2 transition-opacity duration-300 ${status !== 'loading' ? 'opacity-0' : 'opacity-100'}`}
                    >
                        <Progress
                            size="sm"
                            value={progress}
                            color="primary"
                            aria-label="Loading..."
                            className="max-w-md"
                        />
                    </div>
                </CardBody>

                {/* --- FOOTER --- */}
                <CardFooter className="justify-center pb-8 pt-0">
                    {status === 'error' && (
                        <div className="flex gap-4">
                            {onCancel && (
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={onCancel}
                                >
                                    Back to Login
                                </Button>
                            )}
                            {onRetry && (
                                <Button color="primary" onPress={onRetry}>
                                    Try Again
                                </Button>
                            )}
                        </div>
                    )}
                </CardFooter>
            </Card>

            <div className="absolute bottom-8 text-center text-xs text-default-400">
                <p>Secured by HeroUI</p>
            </div>
        </div>
    )
}
