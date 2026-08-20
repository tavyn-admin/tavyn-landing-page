import posthog, { type CaptureResult } from 'posthog-js';

const SENSITIVE_URL_PARAMETERS = new Set([
    'api_key',
    'auth',
    'authorization',
    'code',
    'company',
    'email',
    'first',
    'key',
    'last',
    'name',
    'passcode',
    'password',
    'phone',
    'secret',
    'token',
    'website',
]);

function sanitizeUrl(value: string) {
    try {
        const url = new URL(value, window.location.origin);

        for (const key of Array.from(url.searchParams.keys())) {
            const normalizedKey = key.toLowerCase();
            if (SENSITIVE_URL_PARAMETERS.has(normalizedKey)) {
                url.searchParams.delete(key);
            } else if (normalizedKey === 'returnto') {
                const returnUrl = new URL(
                    url.searchParams.get(key) ?? '',
                    window.location.origin,
                );
                for (const returnKey of Array.from(
                    returnUrl.searchParams.keys(),
                )) {
                    if (SENSITIVE_URL_PARAMETERS.has(returnKey.toLowerCase())) {
                        returnUrl.searchParams.delete(returnKey);
                    }
                }
                url.searchParams.set(
                    key,
                    `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`,
                );
            }
        }

        return url.toString();
    } catch {
        return value;
    }
}

function sanitizePropertyUrls(properties: CaptureResult['properties']) {
    const sanitizedProperties = { ...properties };
    for (const propertyName of [
        '$current_url',
        '$referrer',
        '$initial_current_url',
        '$initial_referrer',
    ] as const) {
        const value = properties[propertyName];
        if (typeof value === 'string') {
            sanitizedProperties[propertyName] = sanitizeUrl(value);
        }
    }

    return sanitizedProperties;
}

function sanitizeEventUrls(event: CaptureResult | null) {
    if (!event) return null;

    return {
        ...event,
        properties: sanitizePropertyUrls(event.properties),
        ...(event.$set && { $set: sanitizePropertyUrls(event.$set) }),
        ...(event.$set_once && {
            $set_once: sanitizePropertyUrls(event.$set_once),
        }),
    };
}

if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
        before_send: sanitizeEventUrls,
        session_recording: {
            maskAllInputs: true,
            maskCapturedNetworkRequestFn: (request) => ({
                ...request,
                name: request.name ? sanitizeUrl(request.name) : request.name,
            }),
        },
    });
}
