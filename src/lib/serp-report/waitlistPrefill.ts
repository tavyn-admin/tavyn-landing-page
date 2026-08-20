'use client';

const SERP_WAITLIST_PREFILL_KEY = 'tavyn:serp-waitlist-prefill';

type SerpWaitlistPrefill = {
    email: string;
    website: string;
};

export function storeSerpWaitlistPrefill(prefill: SerpWaitlistPrefill) {
    try {
        window.sessionStorage.setItem(
            SERP_WAITLIST_PREFILL_KEY,
            JSON.stringify(prefill),
        );
    } catch {
        // Storage can be unavailable in restricted browser contexts.
    }
}

export function takeSerpWaitlistPrefill(): SerpWaitlistPrefill | null {
    try {
        const stored = window.sessionStorage.getItem(SERP_WAITLIST_PREFILL_KEY);
        window.sessionStorage.removeItem(SERP_WAITLIST_PREFILL_KEY);
        if (!stored) return null;

        const value = JSON.parse(stored) as Partial<SerpWaitlistPrefill>;
        if (
            typeof value.email !== 'string' ||
            typeof value.website !== 'string'
        ) {
            return null;
        }

        return { email: value.email, website: value.website };
    } catch {
        return null;
    }
}
