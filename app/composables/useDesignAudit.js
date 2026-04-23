/**
 * Design Audit — client-side state machine.
 *
 * Flow:
 *   idle → auditing → teaser → submitting → unlocked
 *                   ↘ error
 *
 * Kept deliberately simple. The full report is held client-side once
 * we have it; unlocking is purely a UI reveal + a fire-and-forget
 * call to attach the lead details to the CRM row.
 */

import { ref, computed, reactive } from 'vue';

const STATES = Object.freeze({
  IDLE: 'idle',
  AUDITING: 'auditing',
  TEASER: 'teaser',
  SUBMITTING: 'submitting',
  UNLOCKED: 'unlocked',
  ERROR: 'error',
});

export default function useDesignAudit() {
  const state = ref(STATES.IDLE);
  const url = ref('');
  const auditId = ref(null);
  const report = ref(null);
  const auditedUrl = ref(null);
  const errorMessage = ref('');

  const leadForm = reactive({
    email: '',
    name: '',
    company: '',
  });
  const leadError = ref('');

  const isAuditing = computed(() => state.value === STATES.AUDITING);
  const isTeaser = computed(() => state.value === STATES.TEASER);
  const isSubmitting = computed(() => state.value === STATES.SUBMITTING);
  const isUnlocked = computed(() => state.value === STATES.UNLOCKED);
  const hasError = computed(() => state.value === STATES.ERROR);

  async function runAudit(rawUrl) {
    const trimmed = (rawUrl ?? url.value ?? '').trim();
    if (!trimmed) {
      state.value = STATES.ERROR;
      errorMessage.value = 'Please enter a URL.';
      return;
    }

    url.value = trimmed;
    state.value = STATES.AUDITING;
    errorMessage.value = '';
    report.value = null;
    auditId.value = null;
    auditedUrl.value = null;

    try {
      const res = await $fetch('/api/audit', {
        method: 'POST',
        body: { url: trimmed },
      });

      report.value = res.report;
      auditId.value = res.auditId;
      auditedUrl.value = res.url;
      state.value = STATES.TEASER;
    } catch (err) {
      state.value = STATES.ERROR;
      errorMessage.value =
        err?.data?.statusMessage ||
        err?.statusMessage ||
        'Something went wrong. Try again in a moment.';
    }
  }

  async function submitLead() {
    leadError.value = '';

    const email = leadForm.email.trim();
    if (!email) {
      leadError.value = 'Please enter your email.';
      return;
    }
    // Minimal email shape check — mirrors the server.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      leadError.value = 'That email looks off. Check it and try again?';
      return;
    }

    state.value = STATES.SUBMITTING;

    try {
      await $fetch('/api/audit-submit-lead', {
        method: 'POST',
        body: {
          auditId: auditId.value,
          email,
          name: leadForm.name.trim(),
          company: leadForm.company.trim(),
        },
      });
    } catch (err) {
      // Non-fatal — we still reveal the report. The CRM can miss a
      // row occasionally; what we can't do is hold the user's report
      // hostage to a server error.
      console.warn('Lead submit failed; revealing report anyway.', err);
    }

    state.value = STATES.UNLOCKED;
  }

  function reset() {
    state.value = STATES.IDLE;
    url.value = '';
    auditId.value = null;
    report.value = null;
    auditedUrl.value = null;
    errorMessage.value = '';
    leadForm.email = '';
    leadForm.name = '';
    leadForm.company = '';
    leadError.value = '';
  }

  return {
    STATES,
    state,
    url,
    auditId,
    report,
    auditedUrl,
    errorMessage,
    leadForm,
    leadError,
    isAuditing,
    isTeaser,
    isSubmitting,
    isUnlocked,
    hasError,
    runAudit,
    submitLead,
    reset,
  };
}
