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

export const CATEGORY_ORDER: Array<keyof AuditResponse['categories']> = [
  'value_proposition',
  'conversion_architecture',
  'content_craft',
  'structural_hierarchy',
  'credibility_trust',
];
