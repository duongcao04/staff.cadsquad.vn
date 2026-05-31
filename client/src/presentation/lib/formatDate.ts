export function calcDueTo(
    startedAt: string | Date,
    dueAt: string | Date
): string {
    const start = new Date(startedAt)
    const end = new Date(dueAt)
    let diff = Math.max(0, end.getTime() - start.getTime()) // in ms

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    diff -= days * (1000 * 60 * 60 * 24)
    const hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * (1000 * 60 * 60)
    const minutes = Math.floor(diff / (1000 * 60))
    diff -= minutes * (1000 * 60)
    const seconds = Math.floor(diff / 1000)

    let result = ''
    if (days > 0) result += `${days}d `
    if (hours > 0 || days > 0) result += `${hours}h `
    if (minutes > 0 || hours > 0 || days > 0) result += `${minutes}m `
    result += `${seconds}s`

    return result.trim()
}
