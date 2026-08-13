import "server-only";

import { createCp8SupabaseServerClient } from "../../supabase/server";
import {
  buildPublicationRpcArgs,
  publicationRpcResultSchema,
  type PublicationIngestRequest,
} from "./contract";
import { PublicationConflictError, type PublicationStore } from "./ingest";
import { isPublicationConflictRpcError } from "./rpcError";

export class SupabasePublicationStore implements PublicationStore {
  async ingest(request: PublicationIngestRequest) {
    const supabase = createCp8SupabaseServerClient();
    const { data, error } = await supabase.rpc(
      "ingest_serp_report_artifact",
      buildPublicationRpcArgs(request)
    );

    if (error) {
      if (isPublicationConflictRpcError(error)) {
        throw new PublicationConflictError();
      }

      throw new Error("SERP report publication RPC failed.");
    }

    const rows = publicationRpcResultSchema.array().length(1).parse(data);
    return rows[0];
  }
}
