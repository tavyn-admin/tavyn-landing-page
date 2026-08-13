type DemoDraftPreview = {
  draftCategory: string;
  draftPreview: string;
  draftPreviewContinuation: string;
  draftPreviewHeading: string;
  draftReadTimeMinutes: number;
};

const demoDraftPreviews: Record<string, DemoDraftPreview> = {
  "tavyn-seo-analysis": {
    draftCategory: "Content strategy",
    draftReadTimeMinutes: 6,
    draftPreviewHeading: "What a useful brief needs to accomplish",
    draftPreview:
      "A useful SEO content brief does more than collect a target keyword and a list of competing pages. For a founder-led SaaS team, it should connect what people are searching for with the product knowledge only the team can provide, then turn that context into a clear writing plan. The strongest briefs define the reader, the search intent, the questions the article must answer, and the evidence that will make it credible. With that foundation, a writer can move from SERP research to a focused draft without losing the company’s point of view or creating another layer of content operations.",
    draftPreviewContinuation:
      "The brief should give every contributor the same definition of success before drafting begins. That means identifying the reader’s real decision, clarifying the article’s distinct point of view, and showing where product expertise belongs without turning the page into a sales pitch.",
  },
  "regen-seo-analysis": {
    draftCategory: "Peptide education",
    draftReadTimeMinutes: 7,
    draftPreviewHeading: "Start with the evidence, not the protocol",
    draftPreview:
      "AOD-9604 is a synthetic fragment of human growth hormone that is commonly discussed online in connection with fat metabolism and weight-management protocols. Search results often mix early research, commercial claims, dosing instructions, and personal experiences, which can make it difficult to separate established evidence from speculation. Anyone evaluating AOD-9604 should begin with the quality and limits of the available studies, understand that regulatory status and medical guidance vary by location, and avoid treating search content as individualized care. For adults already following a clinician-directed protocol, consistent tracking can help organize dose history, symptoms, biomarkers, and questions for a qualified professional.",
    draftPreviewContinuation:
      "Most of the interest in AOD-9604 traces back to its relationship with a specific region of the growth hormone molecule. Understanding what researchers intended to isolate—and what their studies did not establish—provides a more reliable foundation than beginning with dosage claims found across commercial pages.",
  },
  "fortanix-seo-analysis": {
    draftCategory: "Cloud security",
    draftReadTimeMinutes: 8,
    draftPreviewHeading: "Begin with the assets that carry the most risk",
    draftPreview:
      "A cloud security assessment gives an organization a structured way to identify where sensitive data, identities, workloads, and cryptographic controls are exposed across cloud environments. The goal is not simply to produce a longer list of findings. It is to distinguish urgent risk from background noise and establish a remediation order that reflects business impact, regulatory obligations, and the practical dependencies between systems. A useful assessment starts by defining scope, mapping critical data and services, reviewing access and configuration controls, and examining how encryption keys and secrets are governed. Those findings can then become a prioritized plan with accountable owners and measurable next steps.",
    draftPreviewContinuation:
      "Start by identifying the data, applications, and credentials whose compromise would create the greatest operational or regulatory impact. This narrows the assessment around material exposure and gives security teams a defensible way to prioritize encryption, key-management, access, and configuration findings.",
  },
};

export function getDemoDraftPreview(reportSlug: string, recommendationRank: number) {
  return recommendationRank === 1 ? demoDraftPreviews[reportSlug] : undefined;
}
