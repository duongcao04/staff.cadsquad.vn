export function formatCurrencyVND(
    amount: number | string,
    locale?: 'vi-VN' | 'en-US',
    currency?: 'VND' | 'USD'
): string {
    const number = typeof amount === 'string' ? parseFloat(amount) : amount
    return number.toLocaleString(locale ?? 'vi-VN', {
        style: 'currency',
        currency: currency ?? 'VND',
    })
}
