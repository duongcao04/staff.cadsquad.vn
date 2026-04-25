export class NavigatorHelper {
    static copy = (content: string, onSuccess?: () => void) => {
        if (content) {
            navigator.clipboard
                .writeText(content)
                .then(() => {
                    onSuccess?.()
                })
                .catch((error) => {
                    console.error('Error copying command', error)
                })
        }
    }
}
