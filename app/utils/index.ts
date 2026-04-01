export const hexToRgba = (hex: string, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ISO string to readable date format (e.g., "January 10, 2026")
// Properly handles UTC timezone without shifting date
export function formatDate(
    isoString?: string | null,
    locale: string = 'en-US'
): string {
    if (!isoString) return 'N/A'

    // Expect format: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
    const datePart = isoString.split('T')[0]

    if (!datePart) return isoString

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart)
    if (!match) return isoString

    const [, year, month, day] = match

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    )

    if (Number.isNaN(date.getTime())) return isoString

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

// ISO string to YYYY-MM-DD format for input[type="date"]
// Handles timezone offset to prevent date shift
export const parseDateForInput = (isoString: string | undefined): string => {
    if (!isoString) return ''
    try {
        // Parse ISO string and extract just the date part to avoid timezone issues
        return isoString.split('T')[0] || ''
    } catch {
        return ''
    }
}