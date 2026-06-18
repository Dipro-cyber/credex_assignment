/**
 * Transactional email via Resend.
 * Sends one confirmation email per lead capture.
 */

import { HIGH_SAVINGS_THRESHOLD_MONTHLY } from "@/lib/constants";

interface SendAuditEmailParams {
  to: string;
  auditId: string;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  topRecommendations: string[];
}

export async function sendAuditEmail(
  params: SendAuditEmailParams
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://credexassignment-six.vercel.app";

  if (!apiKey || !fromEmail) {
    console.warn("[email] Resend not configured — skipping email send");
    return false;
  }

  const { to, auditId, totalMonthlySavings, totalAnnualSavings, topRecommendations } = params;
  const isHighSavings = totalMonthlySavings >= HIGH_SAVINGS_THRESHOLD_MONTHLY;
  const shareUrl = `${appUrl}/share/${auditId}`;

  const subject =
    totalMonthlySavings > 0
      ? `Your SpendLens audit — $${totalMonthlySavings.toLocaleString()}/mo in savings found`
      : "Your SpendLens audit — you're spending well";

  const html = buildEmailHtml({ totalMonthlySavings, totalAnnualSavings, topRecommendations, shareUrl, isHighSavings });
  const text = buildEmailText({ totalMonthlySavings, totalAnnualSavings, topRecommendations, shareUrl, isHighSavings });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: fromEmail, to, subject, html, text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[email] Resend error ${response.status}: ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend fetch failed:", err);
    return false;
  }
}

interface TemplateParams {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  topRecommendations: string[];
  shareUrl: string;
  isHighSavings: boolean;
}

function buildEmailHtml(p: TemplateParams): string {
  const savingsLine =
    p.totalMonthlySavings > 0
      ? `<p style="font-size:32px;font-weight:700;color:#111;margin:8px 0;">
           $${p.totalMonthlySavings.toLocaleString()}<span style="font-size:16px;color:#666;">/mo</span>
         </p>
         <p style="color:#666;margin:0 0 24px;">$${p.totalAnnualSavings.toLocaleString()} per year</p>`
      : `<p style="font-size:20px;font-weight:600;color:#059669;margin:8px 0 24px;">✓ You&apos;re spending well</p>`;

  const recsHtml =
    p.topRecommendations.length > 0
      ? `<ul style="padding-left:20px;color:#333;margin:0 0 24px;">
           ${p.topRecommendations.map((r) => `<li style="margin-bottom:6px;">${r}</li>`).join("")}
         </ul>`
      : "";

  const highSavingsBlock = p.isHighSavings
    ? `<div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:24px 0;">
         <p style="font-weight:600;color:#92400e;margin:0 0 8px;">High savings found</p>
         <p style="color:#92400e;margin:0;font-size:14px;">
           Act on the recommendations in your audit to start saving $${p.totalMonthlySavings.toLocaleString()}/mo.
         </p>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
    <div style="background:#111;padding:24px 32px;">
      <p style="color:#fff;font-weight:600;font-size:16px;margin:0;">SpendLens</p>
      <p style="color:#9ca3af;font-size:13px;margin:4px 0 0;">AI Spend Audit Tool</p>
    </div>
    <div style="padding:32px;">
      <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 8px;">Your audit results</h1>
      <p style="color:#666;margin:0 0 16px;">Here&apos;s what we found:</p>
      ${savingsLine}
      ${recsHtml}
      ${highSavingsBlock}
      <a href="${p.shareUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:24px;">
        View full audit →
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        You received this because you submitted an audit on SpendLens.
        Pricing data sourced from official vendor pages.
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(p: TemplateParams): string {
  const savingsLine =
    p.totalMonthlySavings > 0
      ? `Monthly savings: $${p.totalMonthlySavings.toLocaleString()}/mo ($${p.totalAnnualSavings.toLocaleString()}/yr)`
      : "Result: You're spending well — no significant overspend found.";

  const recsText =
    p.topRecommendations.length > 0
      ? `\nTop recommendations:\n${p.topRecommendations.map((r) => `• ${r}`).join("\n")}\n`
      : "";

  return `SpendLens — Your Audit Results
==============================

${savingsLine}
${recsText}
View your full audit: ${p.shareUrl}

---
You received this because you submitted an audit on SpendLens.
Pricing data sourced from official vendor pages.`;
}
