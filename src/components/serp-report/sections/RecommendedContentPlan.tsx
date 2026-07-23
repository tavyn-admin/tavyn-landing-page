"use client";

import { useState } from "react";

import Section from "@/components/Section";
import type { ContentPlanData } from "@/lib/serp-report/schema";
import RecommendedContentPlanCards from "./RecommendedContentPlanCards";
import styles from "./RecommendedContentPlan.module.css";

type RecommendedContentPlanProps = {
  contentPlan: ContentPlanData;
  companyName: string;
};

export default function RecommendedContentPlan({ contentPlan, companyName }: RecommendedContentPlanProps) {
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState<number | null>(null);
  const sectionDesignHeight = selectedRecommendationIndex === null ? 780 : 1140;

  function toggleRecommendation(index: number) {
    setSelectedRecommendationIndex((currentIndex) => (currentIndex === index ? null : index));
  }

  function closeRecommendation() {
    setSelectedRecommendationIndex(null);
  }

  return (
    <Section designH={sectionDesignHeight} fitDesignHeight background="transparent">
      <div className={styles.root}>
        <header className={styles.header}>
          <h1 className={styles.title}>The first content that Tavyn would publish to get {companyName} ranking.</h1>
          <p className={styles.subtitle}>
            Tavyn has mapped the path from search opportunity to execution. The highest-impact opportunities are ready to
            act on.
          </p>
        </header>

        <div className={styles.contentFrame}>
          <RecommendedContentPlanCards
            recommendations={contentPlan.recommendations}
            averageOpportunityScore={contentPlan.summary.average_opportunity_score}
            selectedRecommendationIndex={selectedRecommendationIndex}
            onToggleRecommendation={toggleRecommendation}
            onCloseRecommendation={closeRecommendation}
          />
        </div>
      </div>
    </Section>
  );
}
