import { NextRequest, NextResponse } from "next/server";
import { executeAgentQuery } from "@/lib/agentEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const query =
      body?.query ||
      `Explain the operational inventory status and recommendation for item ${body?.activeItem || body?.item_code || "MPO010014"} in month ${body?.activeMonth || body?.month || "2024-06"}.`;

    const activeItem = body?.activeItem || body?.item_code || "MPO010014";
    const activeMonth = body?.activeMonth || body?.month || "2024-06";

    const result = await executeAgentQuery(query, activeItem, activeMonth);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Explain route error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to generate action brief.",
        provider: "Deterministic Agent Engine",
      },
      { status: 500 }
    );
  }
}
