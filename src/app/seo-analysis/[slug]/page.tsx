import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SerpReportShell from '@/components/serp-report/SerpReportShell';
import { getSerpReportData } from '@/lib/serp-report/getSerpReportData';

type SerpReportPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: SerpReportPageProps): Promise<Metadata> {
    const { slug } = await params;
    const reportData = await getSerpReportData(slug);

    return {
        title: reportData
            ? `${reportData.company.name} | Tavyn SEO Analysis`
            : 'Tavyn SEO Analysis',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function SerpReportPage({ params }: SerpReportPageProps) {
    const { slug } = await params;
    const reportData = await getSerpReportData(slug);

    if (!reportData) {
        notFound();
    }

    return <SerpReportShell auditSlug={slug} reportData={reportData} />;
}
