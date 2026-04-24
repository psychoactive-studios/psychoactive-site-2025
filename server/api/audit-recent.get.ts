/**
 * GET /api/audit-recent
 *
 * Returns the last N audits as a public list — used by the "recently
 * audited" ticker on /design-audit. Only exposes the hostname (never
 * the full URL) and the overall score. Everything else (email, full
 * report, ip_hash, etc.) stays private.
 *
 * Cached at the Vercel edge for 60s — the ticker is social-proof,
 * not live data, so a minute of staleness is fine and saves Supabase
 * round-trips.
 */

import { getAuditSupabaseClient } from '../utils/audit-supabase';

const LIMIT = 8;

interface RecentAuditRow {
  url: string;
  overall_score: number | null;
  created_at: string;
}

export interface RecentAuditItem {
  hostname: string;
  score: number;
  createdAt: string;
}

export default defineEventHandler(async (event) => {
  // Public-safe CDN caching — 60s fresh, 5 min stale-while-revalidate.
  setHeader(
    event,
    'Cache-Control',
    'public, max-age=60, s-maxage=60, stale-while-revalidate=300'
  );

  try {
    const supabase = getAuditSupabaseClient();

    const { data, error } = await supabase
      .from('design_audit_leads')
      .select('url, overall_score, created_at')
      .not('overall_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(LIMIT * 3); // over-fetch so we can dedupe hostnames

    if (error) {
      console.error('Recent audits query failed:', error);
      return { items: [] as RecentAuditItem[] };
    }

    // Dedupe by hostname so a single user running 5 audits of the same
    // site doesn't fill the whole ticker with duplicates.
    const seen = new Set<string>();
    const items: RecentAuditItem[] = [];

    for (const row of (data as RecentAuditRow[]) ?? []) {
      if (items.length >= LIMIT) break;
      const hostname = (() => {
        try {
          return new URL(row.url).hostname.replace(/^www\./, '');
        } catch {
          return null;
        }
      })();
      if (!hostname) continue;
      if (seen.has(hostname)) continue;
      seen.add(hostname);

      items.push({
        hostname,
        score: row.overall_score ?? 0,
        createdAt: row.created_at,
      });
    }

    return { items };
  } catch (err) {
    console.error('Recent audits handler failed:', err);
    return { items: [] as RecentAuditItem[] };
  }
});
