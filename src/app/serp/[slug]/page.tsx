import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SerpReportShell from "@/components/serp-report/SerpReportShell";
import { getReport } from "@/lib/serp-report/getReport";

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
  const report = await getReport(slug);

  if (!report) {
    notFound();
  }

  return <SerpReportShell artifact={report.artifact} />;
}
