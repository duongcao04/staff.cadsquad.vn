import { Expose, Transform } from 'class-transformer'
import dayjs from 'dayjs'

export class SecurityLogResponseDto {
    @Expose()
    id: string

    @Expose()
    event: string

    @Expose()
    @Transform(({ value }) =>
        value ? dayjs(value).format('MMM DD, YYYY hh:mm A') : '-'
    )
    createdAt: string // Chuyển createdAt thành date string cho giao diện

    @Expose()
    @Transform(({ value }) => {
        if (!value) return 'Unknown'
        const parts = value.split('.')
        return parts.length === 4 ? `${parts[0]}.${parts[1]}.x.x` : value
    })
    ipAddress: string // Tự động mask IP Address

    @Expose()
    status: string
}
