/**
 * POST /api/audit-submit-lead
 *
 * Called when a user submits the email form to unlock their full audit
 * report. Takes the audit row id returned from /api/audit and attaches
 * the lead details (email, name, company), then flips status to
 * 'full_report_unlocked'.
 *
 * Intentionally tolerant — if the audit row can't be found (expired,
 * wrong id, someone messing with the form) we still return success so
 * the user isn't stuck. The report itself is already in their browser.
 */

import { getAuditSupabaseClient } from '../utils/audit-supabase';

interface SubmitLeadBody {
  auditId?: string;
  email?: string;
  name?: string;
  company?: string;
}

// Minimal email sanity check — we're not trying to enforce RFC 5322.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitLeadBody>(event);

  const auditId = body?.auditId?.trim();
  const email = body?.email?.trim().toLowerCase();
  const name = body?.name?.trim() || null;
  const company = body?.company?.trim() || null;

  if (!auditId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing audit id.',
    });
  }

  if (!email || !EMAIL_RE.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a valid email address.',
    });
  }

  try {
    const supabase = getAuditSupabaseClient();

    const { data, error } = await supabase
      .from('design_audit_leads')
      .update({
        email,
        name,
        company,
        status: 'full_report_unlocked',
      })
      .eq('id', auditId)
      .select('id')
      .single();

    if (error) {
      // PostgREST returns an error when .single() finds no row. We treat
      // that as a soft failure — the user still gets their report.
      console.error('Audit lead update failed:', error);
      return { ok: true, updated: false };
    }

    return { ok: true, updated: !!data };
  } catch (err) {
    console.error('Audit lead submit failed:', err);
    // Never block the user from their report on storage failure.
    return { ok: true, updated: false };
  }
});
