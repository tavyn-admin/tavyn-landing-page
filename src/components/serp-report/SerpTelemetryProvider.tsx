'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    type ReactNode,
} from 'react';

import {
    captureSerpEvent,
    captureSerpEventOnce,
    type SerpEventName,
    type SerpEventProperties,
} from '@/lib/telemetry';

type SerpTelemetryContextValue = {
    auditSlug: string;
};

const SerpTelemetryContext = createContext<SerpTelemetryContextValue | null>(
    null,
);

export default function SerpTelemetryProvider({
    auditSlug,
    children,
}: {
    auditSlug: string;
    children: ReactNode;
}) {
    const value = useMemo(() => ({ auditSlug }), [auditSlug]);

    useEffect(() => {
        captureSerpEventOnce(
            'audit-viewed',
            auditSlug,
            'serp_audit_viewed',
            {},
        );
    }, [auditSlug]);

    return (
        <SerpTelemetryContext.Provider value={value}>
            {children}
        </SerpTelemetryContext.Provider>
    );
}

export function useSerpTelemetry() {
    const context = useContext(SerpTelemetryContext);
    const auditSlug = context?.auditSlug;
    const capture = useCallback(
        <EventName extends SerpEventName>(
            eventName: EventName,
            properties: SerpEventProperties[EventName],
        ) => {
            if (!auditSlug) return;
            captureSerpEvent(auditSlug, eventName, properties);
        },
        [auditSlug],
    );
    const captureOnce = useCallback(
        <EventName extends SerpEventName>(
            captureKey: string,
            eventName: EventName,
            properties: SerpEventProperties[EventName],
        ) => {
            if (!auditSlug) return;
            captureSerpEventOnce(captureKey, auditSlug, eventName, properties);
        },
        [auditSlug],
    );

    if (!context) {
        throw new Error(
            'useSerpTelemetry must be used within SerpTelemetryProvider',
        );
    }

    return { auditSlug: context.auditSlug, capture, captureOnce };
}
