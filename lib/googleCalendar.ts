/**
 * Google Calendar Integration via Google Identity Services (GIS)
 * Uses implicit OAuth2 flow — no backend required.
 *
 * Setup: add VITE_GOOGLE_CLIENT_ID to .env.local
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const TOKEN_KEY = 'gcal_access_token';
const TOKEN_EXPIRY_KEY = 'gcal_token_expiry';

export interface CalendarEvent {
    id?: string;
    summary: string;
    description?: string;
    start: { date: string };   // YYYY-MM-DD format (all-day event)
    end: { date: string };     // YYYY-MM-DD (day after for Google API)
    colorId?: string;           // '1'=lavender ... '11'=tomato
}

// ─── Token Management ──────────────────────────────────────────────

export function getStoredToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (token && expiry && Date.now() < parseInt(expiry)) return token;
    return null;
}

function storeToken(token: string, expiresInSeconds: number) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + expiresInSeconds * 1000).toString());
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

export function isGCalConfigured(): boolean {
    return !!CLIENT_ID;
}

export function isGCalConnected(): boolean {
    return !!getStoredToken();
}

// ─── OAuth2 Pop-up Flow ────────────────────────────────────────────

/** Opens a Google OAuth2 pop-up and resolves with the access token */
export function connectGoogleCalendar(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!CLIENT_ID) {
            reject(new Error('VITE_GOOGLE_CLIENT_ID is not set in .env.local'));
            return;
        }

        // Load Google Identity Services script dynamically
        const loadGIS = () => {
            (window as any).google.accounts.oauth2
                .initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: (response: any) => {
                        if (response.error) {
                            reject(new Error(response.error));
                        } else {
                            storeToken(response.access_token, response.expires_in);
                            resolve(response.access_token);
                        }
                    },
                })
                .requestAccessToken();
        };

        if ((window as any).google?.accounts) {
            loadGIS();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = loadGIS;
            script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
            document.head.appendChild(script);
        }
    });
}

// ─── Calendar API Calls ────────────────────────────────────────────

async function apiRequest(
    method: string,
    path: string,
    body?: object
): Promise<any> {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated with Google Calendar. Please connect first.');

    const res = await fetch(`${CALENDAR_API}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
        clearToken();
        throw new Error('Google Calendar session expired. Please reconnect.');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Calendar API error: ${res.status}`);
    }

    return res.status === 204 ? null : res.json();
}

/** Add one day to a YYYY-MM-DD string (required by Google for all-day event end date) */
function nextDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

/**
 * Create a new Google Calendar event.
 * Returns the created event ID to store back in Supabase.
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<string> {
    const payload = {
        summary: event.summary,
        description: event.description || '',
        start: { date: event.start.date },
        end: { date: event.end?.date || nextDay(event.start.date) },
        colorId: event.colorId || '1',
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },  // 1 day before
                { method: 'popup', minutes: 60 },         // 1 hour before
            ],
        },
    };

    const result = await apiRequest('POST', '/calendars/primary/events', payload);
    return result.id as string;
}

/**
 * Update an existing Google Calendar event.
 * If event ID is invalid (deleted externally), creates a new one.
 */
export async function updateCalendarEvent(eventId: string, event: CalendarEvent): Promise<string> {
    try {
        const payload = {
            summary: event.summary,
            description: event.description || '',
            start: { date: event.start.date },
            end: { date: event.end?.date || nextDay(event.start.date) },
            colorId: event.colorId || '1',
        };
        const result = await apiRequest('PATCH', `/calendars/primary/events/${eventId}`, payload);
        return result.id as string;
    } catch {
        // If update fails (event deleted externally), create fresh
        return createCalendarEvent(event);
    }
}

/**
 * Delete a Google Calendar event by ID.
 * Silently ignores 404 (already deleted).
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
    try {
        await apiRequest('DELETE', `/calendars/primary/events/${eventId}`);
    } catch (e: any) {
        if (!e.message?.includes('404')) throw e;
    }
}

/**
 * Convenience: create or update depending on whether eventId exists.
 * Returns the (possibly new) event ID.
 */
export async function syncCalendarEvent(eventId: string | null | undefined, event: CalendarEvent): Promise<string> {
    if (eventId) {
        return updateCalendarEvent(eventId, event);
    }
    return createCalendarEvent(event);
}
