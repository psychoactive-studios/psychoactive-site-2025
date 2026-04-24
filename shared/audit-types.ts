/**
 * Design Audit — shared types + category labels.
 *
 * Lives in /shared so both the Nitro server routes and the Vue
 * components can import from the same source. Labels are displayed
 * to the user, so iterate on them here.
 */

export interface AuditFinding {
  type: 'win' | 'issue' | 'opportunity';
  text: string;
  quote: string | null;
}

export interface AuditCategory {
  score: number;
  findings: AuditFinding[];
  next_action: string;
}

export interface AuditResponse {
  overall_score: number;
  summary: string;
  categories: {
    value_proposition: AuditCategory;
    conversion_architecture: AuditCategory;
    content_craft: AuditCategory;
    structural_hierarchy: AuditCategory;
    credibility_trust: AuditCategory;
  };
}

export const CATEGORY_LABELS: Record<keyof AuditResponse['categories'], string> = {
  value_proposition: 'Clarity of Value Proposition',
  conversion_architecture: 'Conversion Architecture',
  content_craft: 'Content & Copy Craft',
  structural_hierarchy: 'Structural Hierarchy',
  credibility_trust: 'Credibility & Trust',
};

// One-liners shown in the category tooltips on the score card + full
// report. Plain English, not marketing speak — this is the "why is
// this being scored?" explanation so the user understands the result
// rather than just reads a number.
export const CATEGORY_DESCRIPTIONS: Record<keyof AuditResponse['categories'], string> = {
  value_proposition:
    "Can a first-time visitor tell what you do, who it's for, and why they should care — within about five seconds?",
  conversion_architecture:
    'Does the site guide visitors toward a clear next action? Are CTAs visible, specific, and placed where attention lands?',
  content_craft:
    'Does the copy sound like a real person — specific, confident, evidence-backed — or like any other marketing site?',
  structural_hierarchy:
    'Is the page organised so the heading structure tells a story? One h1, logical flow, scannable on a quick skim?',
  credibility_trust:
    'Are there concrete proof points — case studies, named clients, metrics, press — or just unbacked claims?',
};

export const CATEGORY_ORDER: Array<keyof AuditResponse['categories']> = [
  'value_proposition',
  'conversion_architecture',
  'content_craft',
  'structural_hierarchy',
  'credibility_trust',
];
