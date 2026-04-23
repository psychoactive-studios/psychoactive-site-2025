/**
 * POST /api/audit
 *
 * Accepts a URL, fetches + cleans it, asks Claude to audit it against
 * the Psychoactive rubric, stores the full report in the CRM (status:
 * 'teaser_viewed', no email yet), and returns the result + the audit
 * row id to the frontend.
 *
 * The frontend uses the id later to attach email/name/company when the
 * user submits the lead form to unlock the full report.
 */

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'node:crypto';
import {
  AuditFetchError,
  fetchAndCleanSite,
  normaliseUrl,
} from '../utils/audit-fetch';
import {
  AUDIT_SYSTEM_PROMPT,
  buildAuditUserPrompt,
  type AuditResponse,
} from '../utils/audit-prompt';
import { getAuditSupabaseClient } from '../utils/audit-supabase';
import { checkRateLimit, getRequestIp } from '../utils/audit-rate-limit';

// If a previous audit of this URL landed in the last 24h, return its
// report instead of calling Claude again. Same URL rarely changes
// meaningfully that quickly, and this saves ~$0.05 + 40s per hit.
const CACHE_WINDOW_MS = 24 * 60 * 60 * 1000;

interface AuditRequestBody {
  url?: string;
  // Set by the frontend when the user explicitly asks for a fresh
  // audit (e.g. a "Run a fresh audit" button). Bypasses the cache.
  fresh?: boolean;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<AuditRequestBody>(event);
  const rawUrl = body?.url;

  if (!rawUrl || typeof rawUrl !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required field: url',
    });
  }

  // Rate limit per IP before we do anything expensive. Auditing a page
  // burns Anthropic credits, so we want to fail fast for repeat callers.
  const ip = getRequestIp(event);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    setHeader(event, 'Retry-After', String(rl.retryAfterSec));
    const minutes = Math.ceil(rl.retryAfterSec / 60);
    throw createError({
      statusCode: 429,
      statusMessage: `Slow down — you've run a few audits recently. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      data: { code: 'RATE_LIMITED', retryAfterSec: rl.retryAfterSec },
    });
  }

  // Normalise the URL once so we can use it for both cache lookup and
  // (later) cache-miss fetches. If normalisation fails, surface the
  // error now — no point doing anything else.
  let normalisedUrl: string;
  try {
    normalisedUrl = normaliseUrl(rawUrl);
  } catch (err) {
    if (err instanceof AuditFetchError) {
      throw createError({
        statusCode: 400,
        statusMessage: err.message,
        data: { code: err.code },
      });
    }
    throw err;
  }

  // 1. Cache lookup. If a matching audit ran in the last 24h, reuse
  // the report. Keeps repeat visits instant and spares the Anthropic
  // budget. The client can force a fresh audit by sending `fresh: true`.
  let cachedReport: AuditResponse | null = null;
  let cachedFromMs: number | null = null;
  const forceFresh = body?.fresh === true;

  if (!forceFresh) {
    try {
      const supabase = getAuditSupabaseClient();
      const sinceIso = new Date(Date.now() - CACHE_WINDOW_MS).toISOString();
      const { data } = await supabase
        .from('design_audit_leads')
        .select('full_report, created_at')
        .eq('url', normalisedUrl)
        .gte('created_at', sinceIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.full_report) {
        cachedReport = data.full_report as AuditResponse;
        cachedFromMs = data.created_at
          ? Date.now() - new Date(data.created_at).getTime()
          : null;
      }
    } catch (err) {
      // Cache lookup is best-effort — if Supabase is unreachable, fall
      // through to a fresh audit rather than failing.
      console.warn('Audit cache lookup failed (non-blocking):', err);
    }
  }

  // 2. If we hit the cache, skip the fetch + Claude call entirely.
  // Otherwise fetch and clean the target site.
  let site: Awaited<ReturnType<typeof fetchAndCleanSite>> | null = null;
  if (!cachedReport) {
    try {
      site = await fetchAndCleanSite(rawUrl);
    } catch (err) {
      if (err instanceof AuditFetchError) {
        throw createError({
          statusCode: 400,
          statusMessage: err.message,
          data: { code: err.code },
        });
      }
      throw err;
    }
  }

  // 3. Call Claude (only on cache miss).
  const config = useRuntimeConfig();
  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Claude API key is not configured. Set ANTHROPIC_API_KEY in the environment.',
    });
  }

  let report: AuditResponse & {
    hero_image_url?: string | null;
    page_title?: string | null;
  };
  let heroImageUrl: string | null = null;
  let pageTitle: string | null = null;

  if (cachedReport) {
    // Cache hit — reuse the previous report. If the cached report was
    // written before we started capturing hero_image_url / page_title,
    // those will be null and the UI just hides those affordances.
    report = cachedReport as typeof report;
    heroImageUrl = report.hero_image_url ?? null;
    pageTitle = report.page_title ?? null;
  } else {
    // Cache miss — call Claude with the freshly-fetched site.
    const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: AUDIT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildAuditUserPrompt({
              url: site!.url,
              title: site!.title,
              description: site!.description,
              html: site!.html,
            }),
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      // Claude sometimes wraps JSON in prose or code fences despite the
      // prompt — be defensive.
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : textBlock.text;

      report = JSON.parse(jsonStr) as AuditResponse;
    } catch (err) {
      console.error('Claude audit failed:', err);
      throw createError({
        statusCode: 502,
        statusMessage:
          'The audit engine couldn\'t process that page. Try again in a moment.',
      });
    }

    // Stamp the captured metadata (hero image, page title) onto the
    // report so it gets persisted alongside the Claude findings. Cache
    // hits can then read it straight back out.
    heroImageUrl = site?.heroImageUrl ?? null;
    pageTitle = site?.title?.trim() || null;
    report.hero_image_url = heroImageUrl;
    report.page_title = pageTitle;
  }

  // 4. Persist the audit row (teaser state, no email yet). Always
  // insert — even on cache hits — so the CRM tracks every visit,
  // and so the row id we return is specific to *this* session's
  // email submission.
  let auditId: string | null = null;
  try {
    const supabase = getAuditSupabaseClient();

    // Hash the IP for abuse tracking without storing PII directly.
    // `ip` is already extracted at the top of the handler for rate limiting.
    const ipHash =
      ip && ip !== 'unknown'
        ? crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16)
        : null;

    const categoryScores = {
      value_proposition: report.categories?.value_proposition?.score ?? null,
      conversion_architecture:
        report.categories?.conversion_architecture?.score ?? null,
      content_craft: report.categories?.content_craft?.score ?? null,
      structural_hierarchy:
        report.categories?.structural_hierarchy?.score ?? null,
      credibility_trust: report.categories?.credibility_trust?.score ?? null,
    };

    const { data, error } = await supabase
      .from('design_audit_leads')
      .insert({
        url: normalisedUrl,
        overall_score: report.overall_score,
        category_scores: categoryScores,
        full_report: report,
        status: 'teaser_viewed',
        ip_hash: ipHash,
        user_agent: getRequestHeader(event, 'user-agent')?.slice(0, 500) || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert failed:', error);
    } else {
      auditId = data?.id ?? null;
    }
  } catch (err) {
    // Storage failure shouldn't block the user from seeing their audit.
    // Log it and carry on — they just won't be tracked as a lead.
    console.error('Audit persist failed (non-blocking):', err);
  }

  return {
    auditId,
    url: normalisedUrl,
    // Let the client know whether this came from cache so it can show
    // a "Run a fresh audit" affordance if the user wants newer data.
    cached: !!cachedReport,
    cachedAgeMs: cachedFromMs,
    heroImageUrl,
    pageTitle,
    report,
  };
});
