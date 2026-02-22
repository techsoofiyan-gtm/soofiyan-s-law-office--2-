/**
 * Google Calendar URL generator for tasks and hearings.
 * Opens a pre-filled Google Calendar event creation page.
 */

interface CalendarEventParams {
    title: string;
    date: string; // YYYY-MM-DD
    description?: string;
    location?: string;
}

/**
 * Generates a Google Calendar "create event" URL pre-filled with the given details.
 * The date format expected is YYYY-MM-DD (all-day event).
 */
export function getGoogleCalendarUrl(params: CalendarEventParams): string {
    const { title, date, description, location } = params;

    // Convert YYYY-MM-DD to YYYYMMDD for Google Calendar
    const dateClean = date.replace(/-/g, '');

    // For an all-day event, end date is the next day
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateClean = endDate.toISOString().split('T')[0].replace(/-/g, '');

    const params_ = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${dateClean}/${endDateClean}`,
    });

    if (description) params_.set('details', description);
    if (location) params_.set('location', location);

    return `https://calendar.google.com/calendar/render?${params_.toString()}`;
}

/**
 * Opens a Google Calendar event in a new tab.
 */
export function openGoogleCalendarEvent(params: CalendarEventParams): void {
    const url = getGoogleCalendarUrl(params);
    window.open(url, '_blank', 'noopener,noreferrer');
}
