/**
 * Dynamic OG image for /share/[id].
 * Generated via Next.js ImageResponse (next/og).
 * Only flexbox CSS is supported — no grid, no tailwind classes.
 */
import { ImageResponse } from "next/og";
import { getAuditById } from "@/lib/supabase";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const audit = await getAuditById(id);

  const savings = audit?.total_monthly_savings ?? 0;
  const annualSavings = audit?.total_annual_savings ?? 0;
  const hasSavings = savings > 0;

  const bgColor = hasSavings ? "#fffbeb" : "#f0fdf4";
  const accentColor = hasSavings ? "#d97706" : "#059669";
  const headlineColor = hasSavings ? "#92400e" : "#065f46";

  const headline = hasSavings
    ? `$${savings.toLocaleString()}/mo`
    : "Spending well";

  const subline = hasSavings
    ? `$${annualSavings.toLocaleString()} per year in potential savings`
    : "No significant AI overspend found";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: bgColor,
          padding: "64px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                }}
              />
            </div>
            <span style={{ fontSize: "20px", fontWeight: "600", color: "#111" }}>
              SpendLens
            </span>
          </div>
          <span style={{ fontSize: "16px", color: "#6b7280" }}>
            spendlens.app
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            {hasSavings ? "This team could save" : "Audit result"}
          </div>

          <div
            style={{
              fontSize: hasSavings ? "96px" : "72px",
              fontWeight: "800",
              color: headlineColor,
              lineHeight: 1,
              marginBottom: "20px",
            }}
          >
            {headline}
          </div>

          <div
            style={{
              fontSize: "28px",
              fontWeight: "500",
              color: accentColor,
            }}
          >
            {subline}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "32px",
            borderTop: `2px solid ${accentColor}30`,
          }}
        >
          <span style={{ fontSize: "18px", color: "#6b7280" }}>
            Free AI spend audit · No login required
          </span>
          <span style={{ fontSize: "18px", fontWeight: "600", color: accentColor }}>
            spendlens.app →
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
