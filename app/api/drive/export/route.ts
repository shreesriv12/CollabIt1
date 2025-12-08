import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redirectUrl = new URL(
      "/api/drive/callback",
      req.nextUrl.origin
    ).toString();

    const oauth2Client = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauth2Client.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
    oauth2Client.searchParams.set("redirect_uri", redirectUrl);
    oauth2Client.searchParams.set(
      "response_type",
      "code"
    );
    oauth2Client.searchParams.set(
      "scope",
      "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/spreadsheets.readonly"
    );
    oauth2Client.searchParams.set("access_type", "offline");
    oauth2Client.searchParams.set("prompt", "consent");

    return NextResponse.json({ authUrl: oauth2Client.toString() });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}