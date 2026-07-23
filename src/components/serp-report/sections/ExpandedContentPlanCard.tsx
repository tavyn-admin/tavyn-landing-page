import type { ContentPlanRecommendation } from "@/lib/serp-report/schema";
import styles from "./RecommendedContentPlan.module.css";

const backArrowSrc = "/figma/email-back.svg";
const chevronDownSrc = "/serp-report/query-analysis/chevron-down.png";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

type RankingPage = {
  title: string;
  position: number;
  domain: string;
};

type ExpandedContentPlanDetails = {
  momentum: {
    oneMonth: string;
    threeMonth: string;
    twelveMonth: string;
  };
  contentAngle: string;
  selectionReasoning: string;
  productConnection: string;
  demandType: string;
  searchIntent: string;
  paidCompetition: string;
  paidCompetitionLevel: string;
  benchmark: {
    averageBacklinks: number;
    averageReferringDomains: number;
    averageDomainRank: number;
  };
  rankingPages: RankingPage[];
};

// TODO: Replace these static fixtures with schema-backed content_plan fields when the artifact is wired.
const staticExpandedDetails: ExpandedContentPlanDetails[] = [
  {
    momentum: {
      oneMonth: "+29%",
      threeMonth: "-36%",
      twelveMonth: "-65%",
    },
    contentAngle:
      "Create a practical, template-led guide that shows founder-led SaaS teams how to turn SERP research and product context into a brief they can actually publish from.",
    selectionReasoning:
      "This is the strongest problem-demand opportunity because it matches Tavyn's brief-writing workflow, has clear commercial intent, and is distinct from generic SEO checklist content.",
    productConnection:
      "Tavyn can show how a brief moves from market evidence to founder review, positioning the product as the bridge between search opportunity and publish-ready execution.",
    demandType: "Problem Demand",
    searchIntent: "Commercial",
    paidCompetition: "+29%",
    paidCompetitionLevel: "Medium",
    benchmark: {
      averageBacklinks: 18,
      averageReferringDomains: 10,
      averageDomainRank: 355,
    },
    rankingPages: [
      { title: "SEO brief templates for SaaS teams", position: 1, domain: "storychief.io" },
      { title: "How to create an SEO content brief", position: 2, domain: "surferseo.com" },
      { title: "Content brief examples for startups", position: 3, domain: "clearscope.io" },
      { title: "SEO content brief checklist", position: 4, domain: "semrush.com" },
    ],
  },
  {
    momentum: {
      oneMonth: "+18%",
      threeMonth: "+11%",
      twelveMonth: "-22%",
    },
    contentAngle:
      "Build a buying-guide style article that helps founders understand when SEO automation should replace manual planning and when human judgment still matters.",
    selectionReasoning:
      "This recommendation creates a direct bridge from solution-aware search behavior to Tavyn's automated planning workflow, while still leaving room for product differentiation.",
    productConnection:
      "Tavyn can anchor the article around automated SERP analysis, query selection, and content workflow handoff instead of generic AI writing claims.",
    demandType: "Solution Demand",
    searchIntent: "Commercial",
    paidCompetition: "+17%",
    paidCompetitionLevel: "High",
    benchmark: {
      averageBacklinks: 34,
      averageReferringDomains: 21,
      averageDomainRank: 418,
    },
    rankingPages: [
      { title: "Best SEO automation software", position: 1, domain: "zapier.com" },
      { title: "SEO automation tools compared", position: 2, domain: "g2.com" },
      { title: "What SEO tasks can be automated", position: 3, domain: "ahrefs.com" },
      { title: "AI SEO automation platform guide", position: 4, domain: "seo.ai" },
    ],
  },
  {
    momentum: {
      oneMonth: "+9%",
      threeMonth: "+24%",
      twelveMonth: "+41%",
    },
    contentAngle:
      "Publish a founder-friendly content planning guide that turns scattered keyword research into a clear publishing sequence for a lean SaaS team.",
    selectionReasoning:
      "The topic has strong intent and gives Tavyn a natural way to explain why content plans should be grounded in validated search opportunities.",
    productConnection:
      "Tavyn can demonstrate how the report identifies priority content, ranks opportunities, and gives teams a first set of pages to publish.",
    demandType: "Problem Demand",
    searchIntent: "Commercial",
    paidCompetition: "+8%",
    paidCompetitionLevel: "Low",
    benchmark: {
      averageBacklinks: 12,
      averageReferringDomains: 7,
      averageDomainRank: 289,
    },
    rankingPages: [
      { title: "SEO content plan template", position: 1, domain: "hubspot.com" },
      { title: "How to build an SEO content plan", position: 2, domain: "backlinko.com" },
      { title: "Content planning for SaaS startups", position: 3, domain: "animalz.co" },
      { title: "SEO content strategy checklist", position: 4, domain: "moz.com" },
    ],
  },
];

type ExpandedContentPlanCardProps = {
  id: string;
  recommendation: ContentPlanRecommendation;
  index: number;
  averageOpportunityScore: number;
  onClose: () => void;
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatInteger(value: number) {
  return integerFormatter.format(value);
}

function formatRecommendationNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, value));
}

function MomentumValue({ value }: { value: string }) {
  const isNegative = value.trim().startsWith("-");

  return <span className={isNegative ? styles.negativeSignal : styles.positiveSignal}>{value}</span>;
}

function SignalValue({
  label,
  value,
  signal = true,
}: {
  label: string;
  value: string;
  signal?: boolean;
}) {
  return (
    <div className={styles.signalValue}>
      <span>{label}</span>
      {signal ? <MomentumValue value={value} /> : <span className={styles.expandedValue}>{value}</span>}
    </div>
  );
}

function DetailBlock({ label, children }: { label: string; children: string }) {
  return (
    <div className={styles.expandedDetailBlock}>
      <div className={styles.expandedLabel}>{label}</div>
      <p>{children}</p>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.expandedHeaderMetric}>
      <div className={styles.expandedLabel}>{label}</div>
      <div className={styles.expandedValue}>{value}</div>
    </div>
  );
}

export default function ExpandedContentPlanCard({
  id,
  recommendation,
  index,
  averageOpportunityScore,
  onClose,
}: ExpandedContentPlanCardProps) {
  const details = staticExpandedDetails[index] ?? staticExpandedDetails[0];
  const targetScoreHeight = `${clampScore(recommendation.opportunityScore)}%`;
  const averageScoreHeight = `${clampScore(averageOpportunityScore)}%`;
  const titleId = `${id}-title`;

  return (
    <section id={id} className={styles.expandedCard} aria-labelledby={titleId}>
      <button type="button" className={styles.expandedBackButton} aria-label="Close expanded content brief" onClick={onClose}>
        <img src={backArrowSrc} alt="" aria-hidden="true" />
      </button>

      <header className={styles.expandedHeader}>
        <h2 id={titleId} title={recommendation.primaryQuery}>
          {recommendation.primaryQuery}
        </h2>

        <div className={styles.expandedHeaderData}>
          <HeaderMetric label="Monthly Search Volume" value={formatInteger(recommendation.monthlySearchVolume)} />
          <div className={styles.expandedMomentumGroup}>
            <div className={styles.expandedLabel}>Search Momentum</div>
            <div className={styles.expandedMomentumValues}>
              <SignalValue label="1 month:" value={details.momentum.oneMonth} />
              <SignalValue label="3 month:" value={details.momentum.threeMonth} />
              <SignalValue label="12 month:" value={details.momentum.twelveMonth} />
            </div>
          </div>
        </div>

        <div className={styles.expandedNumber}>{formatRecommendationNumber(index)}</div>
      </header>

      <div className={styles.expandedBody}>
        <div className={styles.expandedNarrative}>
          <DetailBlock label="Content Angle">{details.contentAngle}</DetailBlock>
          <DetailBlock label="Selection Reasoning">{details.selectionReasoning}</DetailBlock>
          <DetailBlock label="Product Connection">{details.productConnection}</DetailBlock>

          <div className={styles.expandedBenchmark}>
            <div className={styles.expandedLabel}>Current Top-10 Benchmark</div>
            <div className={styles.benchmarkMetrics}>
              <span>
                Average Backlinks: <strong>{formatInteger(details.benchmark.averageBacklinks)}</strong>
              </span>
              <span>
                Average Referring Domains: <strong>{formatInteger(details.benchmark.averageReferringDomains)}</strong>
              </span>
              <span>
                Average Domain Rank: <strong>{formatInteger(details.benchmark.averageDomainRank)}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className={styles.expandedAnalysis}>
          <div className={styles.expandedMetricsRow}>
            <HeaderMetric label="Keyword Difficulty" value={formatNumber(recommendation.keywordDifficulty)} />
            <HeaderMetric label="Demand Type" value={details.demandType} />
            <HeaderMetric label="Search Intent" value={details.searchIntent} />
            <div className={styles.expandedSearchSignalsGroup}>
              <div className={styles.expandedLabel}>Additional Search Signals</div>
              <div className={styles.expandedSearchSignalValues}>
                <SignalValue label="Paid Competition:" value={details.paidCompetition} />
              </div>
            </div>
          </div>

          <div className={styles.expandedLower}>
            <div className={styles.expandedGraphFrame}>
              <div className={styles.expandedGraphHeader}>
                <div className={styles.expandedLabel}>Opportunity Score</div>
                <div className={styles.expandedGraphValue}>{formatNumber(recommendation.opportunityScore)}</div>
              </div>
              <div className={styles.expandedGraph} aria-label={`Opportunity score ${formatNumber(recommendation.opportunityScore)} compared to average ${formatNumber(averageOpportunityScore)}.`} role="group">
                <div className={styles.expandedGraphBarSlot}>
                  <div className={styles.expandedTargetBar} style={{ height: targetScoreHeight }} />
                </div>
                <div className={styles.expandedGraphBarSlot}>
                  <div className={styles.expandedAverageBar} style={{ height: averageScoreHeight }} />
                  <span>Avg {formatNumber(averageOpportunityScore)}</span>
                </div>
              </div>
            </div>

            <div className={styles.rankingPages}>
              <div className={styles.rankingTitle}>10 Ranking Pages Analyzed</div>
              <div className={styles.rankingHeader}>
                <span>Title</span>
                <span>Position</span>
                <span>Domain</span>
              </div>
              <div className={styles.rankingRows}>
                {details.rankingPages.map((page) => (
                  <div className={styles.rankingRow} key={`${page.domain}-${page.position}`}>
                    <span className={styles.rankingPageTitle}>
                      <span title={page.title}>{page.title}</span>
                      <img src={chevronDownSrc} alt="" aria-hidden="true" />
                    </span>
                    <span className={styles.rankingPosition}>{formatInteger(page.position)}</span>
                    <span className={styles.rankingVisit}>
                      <span>Visit</span>
                      <img src={backArrowSrc} alt="" aria-hidden="true" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
