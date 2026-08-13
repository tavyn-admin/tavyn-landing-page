const IDEMPOTENCY_CONFLICT_TOKEN = "serp_publication_idempotency_conflict";

export type PublicationRpcError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function isPublicationConflictRpcError(error: PublicationRpcError): boolean {
  return [error.code, error.message, error.details, error.hint]
    .filter((value): value is string => typeof value === "string")
    .some((value) => value.includes(IDEMPOTENCY_CONFLICT_TOKEN));
}
