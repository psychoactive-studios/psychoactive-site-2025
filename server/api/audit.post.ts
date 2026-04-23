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
} from '../utils/audit-fetch';
import {
  AUDIT_SYSTEM_PROMPT,
  buildAuditUserPrompt,
  type AuditResponse,
} from '../utils/audit-prompt';
import { getAuditSupabaseClient } from '../utils/audit-supabase';
import { checkRateLimit, getRequestIp } from '../utils/audit-rate-limit';

interface AuditRequestBody {
  url?: string;
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

  // 1. Fetch + clean the target site.
  let site;
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

  // 2. Call Claude.
  const config = useRuntimeConfig();
  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Claude API key is not configured. Set ANTHROPIC_API_KEY in the environment.',
    });
  }

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  let report: AuditResponse;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: AUDIT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildAuditUserPrompt({
            url: site.url,
            title: site.title,
            description: site.description,
            html: site.html,
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

  // 3. Persist the audit row (teaser state, no email yet).
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
        url: site.url,
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
    url: site.url,
    report,
  };
});
