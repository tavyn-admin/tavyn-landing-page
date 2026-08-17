import { notFound, permanentRedirect } from 'next/navigation';

type LegacySerpReportPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const LEGACY_SLUG_SUFFIX = '-seo-analysis';

export default async function LegacySerpReportPage({
    params,
}: LegacySerpReportPageProps) {
    const { slug } = await params;

    if (!slug.endsWith(LEGACY_SLUG_SUFFIX)) {
        notFound();
    }

    const companySlug = slug.slice(0, -LEGACY_SLUG_SUFFIX.length);

    if (!companySlug) {
        notFound();
    }

    permanentRedirect(`/seo-analysis/${companySlug}`);
}
