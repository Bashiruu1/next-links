// ─────────────────────────────────────────────────────────────────────────────
// scripts/get-tiktok-token.mts
//
// One-time setup script — run this once to get your TIKTOK_REFRESH_TOKEN.
// The script itself is safe to commit. Never commit .env.local.
//
// SETUP CHECKLIST (do these before running):
//
//   1. Go to https://developers.tiktok.com and open your app
//   2. Under Products → Login Kit → Redirect URI, add:
//        http://localhost:3000/callback
//   3. Ensure these scopes are enabled: user.info.basic, user.info.stats, video.list
//   4. Create .env.local in the repo root with:
//        TIKTOK_CLIENT_KEY=your_client_key
//        TIKTOK_CLIENT_SECRET=your_client_secret
//
// RUN:
//   npx tsx scripts/get-tiktok-token.mts
//
// AFTER YOU GET THE TOKEN:
//   1. Add TIKTOK_REFRESH_TOKEN to Vercel environment variables
//   2. Add TIKTOK_REFRESH_TOKEN as a GitHub Actions secret
//   3. Trigger a rebuild — live TikTok data will appear on your page
// ─────────────────────────────────────────────────────────────────────────────

import * as fs from "node:fs";
import * as http from "node:http";
import * as path from "node:path";
import { exec } from "node:child_process";

// ── Config ────────────────────────────────────────────────────────────────────

const REDIRECT_URI = "http://localhost:3000/callback";
const TOKEN_ENDPOINT = "https://open.tiktokapis.com/v2/oauth/token/";
const AUTH_BASE = "https://www.tiktok.com/v2/auth/authorize";
const SCOPES = "user.info.basic,user.info.stats,video.list";

// ── Parse .env.local ──────────────────────────────────────────────────────────

function parseEnvFile(filePath: string): Record<string, string> {
  const env: Record<string, string> = {};
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

const envPath = path.resolve(process.cwd(), ".env.local");

if (!fs.existsSync(envPath)) {
  console.error(
    "Error: .env.local not found in repo root.\n" +
    "Create it with:\n" +
    "  TIKTOK_CLIENT_KEY=your_client_key\n" +
    "  TIKTOK_CLIENT_SECRET=your_client_secret"
  );
  process.exit(1);
}

const env = parseEnvFile(envPath);

const clientKey = env["TIKTOK_CLIENT_KEY"];
const clientSecret = env["TIKTOK_CLIENT_SECRET"];

if (!clientKey) {
  console.error("Error: TIKTOK_CLIENT_KEY is missing from .env.local");
  process.exit(1);
}
if (!clientSecret) {
  console.error("Error: TIKTOK_CLIENT_SECRET is missing from .env.local");
  process.exit(1);
}

// ── Build auth URL ────────────────────────────────────────────────────────────

const authParams = new URLSearchParams({
  client_key: clientKey,
  response_type: "code",
  scope: SCOPES,
  redirect_uri: REDIRECT_URI,
});
const authUrl = `${AUTH_BASE}?${authParams.toString()}`;

// ── HTTP server + OAuth flow ──────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) {
    res.writeHead(404).end();
    return;
  }

  const url = new URL(req.url, `http://localhost:3000`);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (error) {
    const description = url.searchParams.get("error_description") ?? error;
    res.writeHead(400, { "Content-Type": "text/html" }).end(
      `<h1>Error</h1><p>${description}</p>`
    );
    console.error(`\nTikTok auth error: ${description}`);
    server.close(() => process.exit(1));
    return;
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" }).end(
      `<h1>Error</h1><p>No code received from TikTok.</p>`
    );
    console.error("\nError: No code received in callback.");
    server.close(() => process.exit(1));
    return;
  }

  // Exchange code for tokens
  let exchangeRes: Response;
  try {
    exchangeRes = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }).toString(),
    });
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/html" }).end(
      `<h1>Error</h1><p>Token exchange request failed.</p>`
    );
    console.error("\nError: Token exchange request failed:", err);
    server.close(() => process.exit(1));
    return;
  }

  if (!exchangeRes.ok) {
    const body = await exchangeRes.text().catch(() => "(unreadable)");
    res.writeHead(500, { "Content-Type": "text/html" }).end(
      `<h1>Error</h1><p>Token exchange failed (${exchangeRes.status}). See console.</p>`
    );
    console.error(`\nError: Token exchange failed (${exchangeRes.status}):\n${body}`);
    server.close(() => process.exit(1));
    return;
  }

  const data = await exchangeRes.json() as Record<string, unknown>;
  const refreshToken = data["refresh_token"];

  if (typeof refreshToken !== "string" || !refreshToken) {
    res.writeHead(500, { "Content-Type": "text/html" }).end(
      `<h1>Error</h1><p>No refresh_token in response. See console.</p>`
    );
    console.error("\nError: refresh_token missing from response:", JSON.stringify(data));
    server.close(() => process.exit(1));
    return;
  }

  // Success — send a safe browser response (token never touches the HTTP body)
  res.writeHead(200, { "Content-Type": "text/html" }).end(
    `<h1>Done</h1><p>Refresh token printed to console and copied to clipboard. You can close this tab.</p>`
  );

  console.log(`\nTIKTOK_REFRESH_TOKEN=${refreshToken}\n`);

  exec(`printf '%s' '${refreshToken.replace(/'/g, "'\\''")}' | pbcopy`, (err) => {
    if (err) {
      console.log("(Could not copy to clipboard — pbcopy not available on this system.)");
    } else {
      console.log(
        "✓ Refresh token copied to clipboard. Add it as TIKTOK_REFRESH_TOKEN in " +
        "Vercel environment variables and as a GitHub Actions secret."
      );
    }
    server.close(() => process.exit(0));
  });
});

server.listen(3000, "127.0.0.1", () => {
  console.log(`Opening TikTok auth in browser...`);
  console.log(`If it doesn't open, visit:\n  ${authUrl}\n`);
  exec(`open "${authUrl}"`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      "Error: Port 3000 is already in use.\n" +
      "Stop whatever is running on port 3000 (e.g. `next dev`) and try again."
    );
  } else {
    console.error("Error starting server:", err.message);
  }
  process.exit(1);
});
