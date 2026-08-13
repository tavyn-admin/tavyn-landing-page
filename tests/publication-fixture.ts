import {
  computeArtifactSha256,
  computePublicationIdempotencyKey,
} from "../src/lib/serp-report/publication/validation";

export const TEST_TOKEN = "fixture-token-that-is-longer-than-thirty-two-bytes";
export const SOURCE_JOB_ID = "48f2d6a3-bfe1-4b58-bd15-dd93bdd430b3";
export const LEASE_TOKEN = "58f2d6a3-bfe1-4b58-bd15-dd93bdd430b4";
export const PUBLICATION_ID = "d364d21e-4ea4-4dbd-9169-a2ec3c8762e2";

function makeValidatedQuery(index: number, territory: "problem_demand" | "solution_demand") {
  return {
    query_id: `query-${index}`,
    query: `example query ${index}`,
    core_keyword: `example ${index}`,
    validation_reasoning: "The query matches the supplied company and market.",
    territory,
    metrics: {
      cpc: 1,
      search_intent: { main: "commercial", secondary: [] },
      search_volume_trend: { monthly: 0, quarterly: 0, yearly: 0 },
      search_volume: 100,
      keyword_difficulty: 20,
      paid_competition_level: "LOW",
      average_top_10: { backlinks: 10, referring_domains: 5 },
    },
    opportunity_metrics: {
      demand_score: 0.5,
      attainability_score: 0.5,
      opportunity_score: 50,
      search_volume_used: 100,
      keyword_difficulty_used: 20,
      keyword_difficulty_original: 20,
      keyword_difficulty_was_imputed: false,
      territory_p95_search_volume: 200,
    },
  };
}

function makeContentPlanItem(index: number, territory: "problem_demand" | "solution_demand") {
  return {
    query_id: `query-${index}`,
    territory,
    confidence: "high",
    core_keyword: `example ${index}`,
    primary_query: `example query ${index}`,
    recommended_title: `Example guide ${index}`,
    recommended_page_type: "guide",
    content_angle: "A focused, useful angle.",
    product_connection: "Connects the query to the product.",
    selection_reasoning: "Selected from the validated opportunity set.",
    recommendation_rank: index,
    query_metrics: {
      cpc: 1,
      search_intent: { main: "commercial", secondary: [] },
      search_volume: 100,
      keyword_difficulty: 20,
      paid_competition: 0.2,
      paid_competition_level: "LOW",
      search_volume_trend: { monthly: 0, quarterly: 0, yearly: 0 },
      average_top_10: { backlinks: 10, referring_domains: 5, main_domain_rank: 40 },
    },
    opportunity_metrics: {
      opportunity_score: 50,
      volume_score: 50,
      difficulty_score: 50,
      search_volume_used: 100,
      keyword_difficulty_used: 20,
      keyword_difficulty_original: 20,
      keyword_difficulty_was_imputed: false,
      maximum_territory_search_volume: 200,
    },
    serp_results: {
      provider: "fixture",
      searched_at: "2026-08-12T17:00:00.000Z",
      results_received: 1,
      ranking_pages: [
        {
          position: 1,
          title: `Ranking page ${index}`,
          domain: "competitor.example",
          url: `https://competitor.example/page-${index}`,
          snippet: "Synthetic fixture result.",
          published_date: null,
        },
      ],
    },
  };
}

export function makeArtifact() {
  return {
    schema_version: "fixture-v1",
    report_id: "report-123",
    report_slug: "example-report",
    run_id: "fixture-run-1",
    generated_at: "2026-08-12T18:00:00.000Z",
    status: "complete",
    warnings: [],
    website_url: "https://example.com",
    search_market: {
      search_engine: "google",
      country: "united states",
      language_name: "english",
      device: "desktop",
    },
    company: {
      name: "Example, Inc.",
      domain: "example.com",
      primary_icp: { name: "Founder", description: "Early-stage founders" },
      product_angle: "A product angle",
      product_summary: "A product summary",
      product_category: "SaaS",
      category_point_of_view: "A point of view",
      primary_differentiators: [{ title: "Focus", description: "Focused execution" }],
    },
    analysis_coverage: {
      queries_discovered: 3,
      queries_evaluated: 3,
      queries_validated: 3,
      ranking_pages_analyzed: 3,
      competitor_domains_found: 0,
      problem_queries_validated: 2,
      solution_queries_validated: 1,
      content_opportunities_scored: 3,
      content_recommendations_selected: 3,
    },
    validated_queries: {
      summary: {
        total: 3,
        problem_demand: 2,
        solution_demand: 1,
        combined_monthly_search_volume: 300,
        average_monthly_search_volume: 100,
        median_monthly_search_volume: 100,
        median_keyword_difficulty: 20,
      },
      queries: [
        makeValidatedQuery(1, "problem_demand"),
        makeValidatedQuery(2, "problem_demand"),
        makeValidatedQuery(3, "solution_demand"),
      ],
    },
    competitor_landscape: {
      scope: { query_count: 3 },
      summary: {
        total_domains_found: 0,
        competitors_included: 0,
        target_domain_excluded: true,
      },
      competitors: [],
    },
    content_plan: {
      summary: {
        selected_count: 3,
        problem_demand_count: 2,
        solution_demand_count: 1,
        average_opportunity_score: 50,
      },
      items: [
        makeContentPlanItem(1, "problem_demand"),
        makeContentPlanItem(2, "problem_demand"),
        makeContentPlanItem(3, "solution_demand"),
      ],
    },
    content_opportunities: {
      scored: [
        { query_id: "query-1", opportunity_score: 50 },
        { query_id: "query-2", opportunity_score: 50 },
        { query_id: "query-3", opportunity_score: 50 },
      ],
    },
  };
}

export function makePublicationRequest() {
  const artifact = makeArtifact();
  const artifactSha256 = computeArtifactSha256(artifact);
  const identity = {
    sourceJobId: SOURCE_JOB_ID,
    leaseToken: LEASE_TOKEN,
    workflowRevision: 1,
    reportId: artifact.report_id,
    slug: artifact.report_slug,
    artifactSha256,
  };

  return {
    idempotencyKey: computePublicationIdempotencyKey(identity),
    ...identity,
    websiteUrl: artifact.website_url,
    canonicalDomain: artifact.company.domain,
    companyName: artifact.company.name,
    artifact,
  };
}

export function makeRpcResult(outcome: "created" | "replayed" = "created") {
  const request = makePublicationRequest();
  return {
    outcome,
    publication_id: PUBLICATION_ID,
    source_job_id: request.sourceJobId,
    slug: request.slug,
    report_id: request.reportId,
    artifact_sha256: request.artifactSha256,
    canonical_domain: request.canonicalDomain,
    status: "complete" as const,
  };
}

export function makeHttpRequest(body: unknown = makePublicationRequest(), headers: HeadersInit = {}) {
  const defaultRequest = makePublicationRequest();
  return new Request("http://127.0.0.1:3000/api/serp-reports/ingest", {
    method: "POST",
    headers: {
      authorization: `Bearer ${TEST_TOKEN}`,
      "content-type": "application/json",
      "idempotency-key": defaultRequest.idempotencyKey,
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
