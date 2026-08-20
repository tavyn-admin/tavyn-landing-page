'use client';

import posthog from 'posthog-js';

export const REPORT_VERSION = 'v1' as const;

export type WaitlistSource = 'landing_page' | 'serp_report';
export type WaitlistFailureType =
    'validation' | 'duplicate' | 'server' | 'network';

export type SerpEventProperties = {
    serp_audit_viewed: Record<string, never>;
    serp_section_viewed: {
        section_id:
            | 'report_overview'
            | 'company_product_profile'
            | 'analysis_scope'
            | 'query_analysis'
            | 'competitor_landscape'
            | 'recommended_content_plan'
            | 'report_cta';
        section_index: number;
    };
    serp_query_opened: {
        query_id: string;
        query_status: 'validated' | 'scored' | 'selected';
        demand_type: 'Problem' | 'Solution';
    };
    serp_query_list_expanded: {
        surface: 'desktop' | 'mobile';
    };
    serp_competitor_opened: {
        competitor_id: string;
        competitor_rank: number;
    };
    serp_recommendation_viewed: {
        recommendation_id: string;
        recommendation_rank: number;
    };
    serp_search_evidence_opened: {
        recommendation_id: string;
        recommendation_rank: number;
    };
    serp_cta_started: {
        cta_location: 'report_bottom';
    };
    serp_cta_clicked: {
        cta_location: 'report_bottom';
    };
};

type WaitlistEventProperties = {
    waitlist_form_viewed: {
        source: 'serp_report';
    };
    waitlist_submission_succeeded: {
        source: WaitlistSource;
    };
    waitlist_submission_failed: {
        source: WaitlistSource;
        failure_type: WaitlistFailureType;
    };
};

export type SerpEventName = keyof SerpEventProperties;
type WaitlistEventName = keyof WaitlistEventProperties;

const capturedOnce = new Set<string>();

function isConfigured() {
    return Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);
}

export function captureSerpEvent<EventName extends SerpEventName>(
    auditSlug: string,
    eventName: EventName,
    properties: SerpEventProperties[EventName],
) {
    if (!isConfigured()) return;

    posthog.capture(eventName, {
        audit_slug: auditSlug,
        report_version: REPORT_VERSION,
        ...properties,
    });
}

export function captureSerpEventOnce<EventName extends SerpEventName>(
    captureKey: string,
    auditSlug: string,
    eventName: EventName,
    properties: SerpEventProperties[EventName],
) {
    const key = `${auditSlug}:${captureKey}`;
    if (capturedOnce.has(key)) return;

    capturedOnce.add(key);
    captureSerpEvent(auditSlug, eventName, properties);
}

export function captureWaitlistEvent<EventName extends WaitlistEventName>(
    eventName: EventName,
    properties: WaitlistEventProperties[EventName],
) {
    if (!isConfigured()) return;
    posthog.capture(eventName, properties);
}

export function captureWaitlistEventOnce<EventName extends WaitlistEventName>(
    captureKey: string,
    eventName: EventName,
    properties: WaitlistEventProperties[EventName],
) {
    if (capturedOnce.has(captureKey)) return;

    capturedOnce.add(captureKey);
    captureWaitlistEvent(eventName, properties);
}

export function normalizeWaitlistSource(
    value: string | null | undefined,
): WaitlistSource {
    return value === 'serp_report' ? 'serp_report' : 'landing_page';
}
