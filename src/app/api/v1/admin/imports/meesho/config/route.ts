import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const currentToken = process.env.APIFY_API_TOKEN || "";
    const hasToken = currentToken.trim().length > 0;
    const masked = hasToken
      ? `${currentToken.substring(0, 10)}...${currentToken.slice(-4)}`
      : "";

    return NextResponse.json({
      success: true,
      hasToken,
      maskedToken: masked,
      mockFallback: process.env.APIFY_MOCK_FALLBACK === "true",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";

    // Update in-memory environment
    process.env.APIFY_API_TOKEN = token;

    // Persist to .env file
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf-8");
        if (envContent.includes("APIFY_API_TOKEN=")) {
          envContent = envContent.replace(
            /APIFY_API_TOKEN=.*/g,
            `APIFY_API_TOKEN="${token}"`
          );
        } else {
          envContent += `\nAPIFY_API_TOKEN="${token}"\n`;
        }
        fs.writeFileSync(envPath, envContent, "utf-8");
      }
    } catch (fsErr) {
      console.warn("Could not write token to .env file:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: token
        ? "Apify API Token saved successfully! Live scraping is now active."
        : "Token cleared. Using realistic fallback mode.",
      hasToken: Boolean(token),
      maskedToken: token ? `${token.substring(0, 10)}...${token.slice(-4)}` : "",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
