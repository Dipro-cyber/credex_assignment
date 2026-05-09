/**
 * POST /api/leads — Lead capture endpoint.
 * Full implementation (Supabase + Resend) in Commit 7.
 * This stub accepts the request and returns 200 so the UI works end-to-end.
 */
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.email || typeof body.email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // TODO (Commit 7): store in Supabase + send Resend confirmation email
    // For now, log and return success
    console.log("[leads stub] received:", {
      auditId: body.auditId,
      email: body.email,
      totalMonthlySavings: body.totalMonthlySavings,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
