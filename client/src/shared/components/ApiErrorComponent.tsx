import { isAxiosError } from 'axios'

export function ApiErrorComponent({ error }: { error: unknown }) {
    let errorMessage = 'An unexpected error occurred.'
    let statusCode = null

    // Check if the error came specifically from Axios
    if (isAxiosError(error)) {
        // Extract the message from your backend's response payload (e.g., { message: "Not Found" })
        errorMessage = error.response?.data?.message || error.message
        statusCode = error.response?.status
    } else if (error instanceof Error) {
        errorMessage = error.message
    }

    return (
        <div
            style={{
                padding: '2rem',
                color: 'red',
                border: '1px solid red',
                borderRadius: '8px',
            }}
        >
            <h2>Oops! Something went wrong.</h2>
            {statusCode && <h3>Error Code: {statusCode}</h3>}
            <p>{errorMessage}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
        </div>
    )
}
