import "server-only";

import { createCp8SupabaseServerClient } from "../../supabase/server";
import { SAFE_ROUTE_SLUG_PATTERN, type PublicationProof } from "./contract";
import { parsePublicationProofRow, PUBLICATION_PROOF_SELECT, type PublicationProofRow } from "./proof";
export { PUBLICATION_PROOF_ELEMENT_ID, serializePublicationProof } from "./proof";

export async function getPublicationProof(slug: string): Promise<PublicationProof | null> {
  const normalizedSlug = slug.trim();
  if (normalizedSlug.length === 0 || normalizedSlug.length > 160 || !SAFE_ROUTE_SLUG_PATTERN.test(normalizedSlug)) {
    return null;
  }

  const supabase = createCp8SupabaseServerClient();
  const { data, error } = await supabase
    .from("serp_reports")
    .select(PUBLICATION_PROOF_SELECT)
    .eq("slug", normalizedSlug)
    .eq("status", "complete")
    .maybeSingle<PublicationProofRow>();

  if (error) {
    throw new Error("Unable to load SERP publication proof.");
  }

  if (!data) {
    return null;
  }

  return parsePublicationProofRow(data);
}
