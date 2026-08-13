import { createPublicationIngestHandler } from "@/lib/serp-report/publication/ingest";
import { SupabasePublicationStore } from "@/lib/serp-report/publication/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createPublicationIngestHandler({
  configuredToken: process.env.SERP_REPORT_INGEST_TOKEN,
  store: new SupabasePublicationStore(),
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
