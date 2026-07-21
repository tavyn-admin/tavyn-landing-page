import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SerpReportShell from "@/components/serp-report/SerpReportShell";
import { getAnalysisCoverage } from "@/lib/serp-report/getAnalysisCoverage";

type SerpReportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SerpReportPage({ params }: SerpReportPageProps) {
  const { slug } = await params;
  const analysisCoverage = await getAnalysisCoverage(slug);

  if (!analysisCoverage) {
    notFound();
  }

  return <SerpReportShell analysisCoverage={analysisCoverage} />;
}
