import { type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js'

interface PhoneOutput {
    country: CountryCode | null
    formatted: string
    raw: string
}

export const phoneNumberFormatter = (
    rawPhone: string,
    defaultCountry: CountryCode = 'VN'
): PhoneOutput => {
    if (!rawPhone || rawPhone.trim() === '-' || rawPhone.trim().length < 2) {
        return { country: null, formatted: '-', raw: '' }
    }

    try {
        // Thêm tham số defaultCountry để thư viện tự hiểu '0' ở đầu là của quốc gia nào
        const phoneNumber = parsePhoneNumberFromString(rawPhone, defaultCountry)

        if (phoneNumber && phoneNumber.isValid()) {
            return {
                country: phoneNumber.country || null,
                // Trả về định dạng quốc tế (E.164) để gửi lên Server: +84123456789
                formatted: phoneNumber.formatInternational(),
                raw: phoneNumber.number, // Ví dụ: +84123456789
            }
        }
    } catch (error) {
        console.log('Parse phone number fail', error)
    }

    return { country: null, formatted: rawPhone, raw: rawPhone }
}
