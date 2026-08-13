import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SerpReportShell from "@/components/serp-report/SerpReportShell";
import { getSerpReportData } from "@/lib/serp-report/getSerpReportData";
import {
  getPublicationProof,
  PUBLICATION_PROOF_ELEMENT_ID,
  serializePublicationProof,
} from "@/lib/serp-report/publication/readback";

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
  const [reportData, publicationProof] = await Promise.all([
    getSerpReportData(slug),
    getPublicationProof(slug),
  ]);

  if (!reportData || !publicationProof || publicationProof.slug !== slug) {
    notFound();
  }

  return (
    <>
      <script
        id={PUBLICATION_PROOF_ELEMENT_ID}
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: serializePublicationProof(publicationProof),
        }}
      />
      <SerpReportShell reportData={reportData} />
    </>
  );
}
