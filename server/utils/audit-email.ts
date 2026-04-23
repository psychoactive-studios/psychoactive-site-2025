/**
 * Design Audit — send the audit report by email via Resend.
 *
 * Triggered after a successful lead submission in
 * /api/audit-submit-lead. The email is a short version of the report
 * (summary + category scores + link to the full interactive report on
 * the site) — not a full dump. Reasons:
 *   - A short email is more likely to be read than a wall of text.
 *   - Clicking "View full findings" drives the reader back to the
 *     site where engagement = lead quality signals.
 *   - Smaller payload = better deliverability.
 *
 * Uses Resend's HTTP API directly so there's no SDK dependency.
 * Returns `ok: true` on success; logs and returns `ok: false` on
 * failure without throwing — the caller shouldn't block the user's
 * report unlock just because an email couldn't be sent.
 */

import type { AuditResponse } from './audit-prompt';

export interface AuditEmailPayload {
  to: string;
  name?: string | null;
  company?: string | null;
  auditedUrl: string;
  report: AuditResponse;
  siteOrigin: string; // e.g. https://psychoactive.co.nz — for building the "view full report" link
}

export interface AuditEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  value_proposition: 'Clarity of value proposition',
  conversion_architecture: 'Conversion architecture',
  content_craft: 'Content & copy craft',
  structural_hierarchy: 'Structural hierarchy',
  credibility_trust: 'Credibility & trust',
};

const CATEGORY_ORDER = [
  'value_proposition',
  'conversion_architecture',
  'content_craft',
  'structural_hierarchy',
  'credibility_trust',
];

function scoreBand(score: number): string {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Mixed';
  if (score >= 40) return 'Needs work';
  return 'Struggling';
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailSubject(report: AuditResponse, auditedUrl: string): string {
  const hostname = (() => {
    try {
      return new URL(auditedUrl).hostname.replace(/^www\./, '');
    } catch {
      return auditedUrl;
    }
  })();
  return `Your design audit for ${hostname} — ${report.overall_score}/100`;
}

function buildEmailHtml(payload: AuditEmailPayload): string {
  const { name, auditedUrl, report, siteOrigin } = payload;
  const score = report.overall_score;
  const band = scoreBand(score);
  const hostname = (() => {
    try {
      return new URL(auditedUrl).hostname.replace(/^www\./, '');
    } catch {
      return auditedUrl;
    }
  })();
  const viewFullUrl = `${siteOrigin}/design-audit?url=${encodeURIComponent(auditedUrl)}`;
  const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim().split(' ')[0])},` : 'Hi,';

  const categoryRows = CATEGORY_ORDER.map((key) => {
    const cat = report.categories?.[key as keyof AuditResponse['categories']];
    if (!cat) return '';
    const pct = Math.round((cat.score / 20) * 100);
    return `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; color: #c8c8c8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px;">
          ${escapeHtml(CATEGORY_LABELS[key] || key)}
        </td>
        <td align="right" style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; color: #ffffff; font-family: 'SF Mono', Menlo, monospace; font-size: 14px; font-weight: 500; white-space: nowrap;">
          ${cat.score}/20
        </td>
        <td style="padding: 10px 0 10px 16px; border-bottom: 1px solid #2a2a2a; width: 120px;">
          <div style="background: #2a2a2a; height: 4px; border-radius: 2px; overflow: hidden;">
            <div style="background: #ffffff; height: 100%; width: ${pct}%;"></div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(buildEmailSubject(report, auditedUrl))}</title>
</head>
<body style="margin: 0; padding: 0; background: #0b0b0b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #0b0b0b;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Eyebrow -->
          <tr>
            <td style="padding-bottom: 16px; color: #8a8a8a; font-family: 'SF Mono', Menlo, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;">
              Psychoactive Studios · Design Audit
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 24px; color: #c8c8c8; font-size: 16px; line-height: 1.6;">
              ${greeting}<br />
              Here's the audit you ran on <strong style="color: #ffffff;">${escapeHtml(hostname)}</strong>.
            </td>
          </tr>

          <!-- Score block -->
          <tr>
            <td style="padding: 32px 0; border-top: 1px solid #2a2a2a; border-bottom: 1px solid #2a2a2a;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: bottom;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 72px; line-height: 1; font-weight: 300; color: #ffffff; letter-spacing: -0.03em;">
                      ${score}<span style="font-size: 24px; color: #6a6a6a; margin-left: 4px;">/100</span>
                    </div>
                    <div style="margin-top: 12px; color: #c8c8c8; font-family: 'SF Mono', Menlo, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;">
                      ${band}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 32px 0; color: #e5e5e5; font-size: 16px; line-height: 1.65;">
              ${escapeHtml(report.summary || '')}
            </td>
          </tr>

          <!-- Category breakdown -->
          <tr>
            <td style="padding-bottom: 8px; color: #8a8a8a; font-family: 'SF Mono', Menlo, monospace; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em;">
              By category
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${categoryRows}
              </table>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td align="center" style="padding: 16px 0 48px 0;">
              <a href="${escapeHtml(viewFullUrl)}" style="display: inline-block; background: #ffffff; color: #0b0b0b; text-decoration: none; padding: 14px 28px; border-radius: 999px; font-family: 'SF Mono', Menlo, monospace; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;">
                View the full findings →
              </a>
            </td>
          </tr>

          <!-- Soft follow-up -->
          <tr>
            <td style="padding: 32px 0; border-top: 1px solid #2a2a2a; color: #8a8a8a; font-size: 14px; line-height: 1.6;">
              Working on your site? If any of this resonates and you'd
              like help thinking it through, just reply to this email —
              we'll take a look.
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; color: #5a5a5a; font-size: 12px; line-height: 1.5;">
              Psychoactive Studios · Wellington, New Zealand<br />
              You're getting this because you ran a free design audit on psychoactive.co.nz.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText(payload: AuditEmailPayload): string {
  const { name, auditedUrl, report, siteOrigin } = payload;
  const hostname = (() => {
    try {
      return new URL(auditedUrl).hostname.replace(/^www\./, '');
    } catch {
      return auditedUrl;
    }
  })();
  const viewFullUrl = `${siteOrigin}/design-audit?url=${encodeURIComponent(auditedUrl)}`;
  const greeting = name?.trim() ? `Hi ${name.trim().split(' ')[0]},` : 'Hi,';

  const categoryLines = CATEGORY_ORDER.map((key) => {
    const cat = report.categories?.[key as keyof AuditResponse['categories']];
    if (!cat) return null;
    return `  ${CATEGORY_LABELS[key] || key}: ${cat.score}/20`;
  })
    .filter(Boolean)
    .join('\n');

  return `${greeting}

Here's the audit you ran on ${hostname}.

OVERALL SCORE: ${report.overall_score}/100 (${scoreBand(report.overall_score)})

${report.summary || ''}

BY CATEGORY
${categoryLines}

View the full findings:
${viewFullUrl}

---

Working on your site? If any of this resonates and you'd like help
thinking it through, just reply to this email — we'll take a look.

Psychoactive Studios · Wellington, New Zealand
You're getting this because you ran a free design audit on psychoactive.co.nz.
`;
}

/**
 * Sends the audit report to the user via Resend. Non-throwing — logs
 * errors and returns a result object. Skipped cleanly if Resend isn't
 * configured (keeps dev/preview deploys working before the env vars
 * are wired up).
 */
export async function sendAuditReportEmail(
  payload: AuditEmailPayload
): Promise<AuditEmailResult> {
  const config = useRuntimeConfig();
  const apiKey = config.resendApiKey as string | undefined;
  const fromAddress =
    (config.auditFromEmail as string | undefined) || 'audit@psychoactive.co.nz';

  if (!apiKey) {
    // Not configured — skip silently. The user still sees the report
    // on screen; they just don't get the email follow-up.
    return { ok: false, skipped: true };
  }

  if (!payload.to) {
    return { ok: false, error: 'Missing recipient email' };
  }

  const subject = buildEmailSubject(payload.report, payload.auditedUrl);
  const html = buildEmailHtml(payload);
  const text = buildEmailText(payload);

  try {
    const res = await $fetch<{ id?: string; message?: string }>(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          from: `Psychoactive Studios <${fromAddress}>`,
          to: [payload.to],
          subject,
          html,
          text,
          reply_to: 'hello@psychoactive.co.nz',
        },
      }
    );

    if (!res?.id) {
      return { ok: false, error: res?.message || 'Resend returned no id' };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Audit email send failed:', message);
    return { ok: false, error: message };
  }
}
