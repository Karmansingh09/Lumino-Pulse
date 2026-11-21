import { NextRequest, NextResponse } from "next/server";
import { executeAgentQuery } from "@/lib/agentEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.query !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. 'query' string is required." },
        { status: 400 }
      );
    }

    const query = body.query.trim();
    if (query.length === 0) {
      return NextResponse.json(
        { error: "Query cannot be empty." },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: "Query exceeds maximum length of 500 characters." },
        { status: 400 }
      );
    }

    const { activeItem, activeMonth } = body;

    const result = await executeAgentQuery(query, activeItem, activeMonth);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal agent execution error",
        provider: "Deterministic Agent Engine",
      },
      { status: 500 }
    );
  }
}
