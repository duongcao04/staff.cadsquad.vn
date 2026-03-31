import { addToast } from '@heroui/react'
import { type ApiError } from '../axios'

export const onErrorToast = (error: unknown, title: string) => {
    // Cast to your custom error type
    const err = error as unknown as ApiError

    // Default fallback
    let description: React.ReactNode = 'Something went wrong'

    // Check if message exists
    if (err?.message) {
        if (Array.isArray(err.message)) {
            // CASE: Array of strings -> Render a list
            description = (
                <ul className="list-disc pl-4 m-0 space-y-1">
                    {err.message.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            )
        } else {
            // CASE: Single string -> Render text
            description = err.message
        }
    }

    addToast({
        title,
        description,
        color: 'danger',
    })
}
