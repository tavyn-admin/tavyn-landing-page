import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
    serpReportArtifactSchema,
    type SerpReportArtifact,
} from '@/lib/serp-report/schema';

const SAFE_ROUTE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 160;

type SerpReportRow = {
    id: string;
    report_id: string;
    slug: string;
    website_url: string;
    company_name: string;
    status: string;
    created_at: string;
    updated_at: string;
    artifact: unknown;
};

export type SerpReport = Omit<SerpReportRow, 'artifact'> & {
    artifact: SerpReportArtifact;
};

function isSafeRouteSlug(slug: string) {
    return (
        slug.length > 0 &&
        slug.length <= MAX_SLUG_LENGTH &&
        SAFE_ROUTE_SLUG.test(slug)
    );
}

export async function getReport(slug: string): Promise<SerpReport | null> {
    const normalizedSlug = slug.trim();

    if (!isSafeRouteSlug(normalizedSlug)) {
        return null;
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('serp_reports')
        .select(
            'id, report_id, slug, website_url, company_name, status, created_at, updated_at, artifact',
        )
        .eq('slug', normalizedSlug)
        .eq('status', 'complete')
        .maybeSingle<SerpReportRow>();

    if (error) {
        throw new Error(
            `Unable to load SERP report "${normalizedSlug}": ${error.message}`,
        );
    }

    if (!data) {
        return null;
    }

    const artifact = serpReportArtifactSchema.parse(data.artifact);

    return {
        id: data.id,
        report_id: data.report_id,
        slug: data.slug,
        website_url: data.website_url,
        company_name: data.company_name,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        artifact,
    };
}
