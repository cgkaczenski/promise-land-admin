import { NextResponse } from "next/server";

const allowedOrigins = [
  "https://www.promisedlandorphanage.com",
  "https://promise-land-admin.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

export function getCorsHeaders(origin?: string) {
  const requestOrigin = origin || "*";

  // If a specific origin is provided and it's in our allowed list, use it
  if (origin && allowedOrigins.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
    };
  }

  // Otherwise, use the first allowed origin as fallback
  return {
    "Access-Control-Allow-Origin": allowedOrigins[0],
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCors(req: Request) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin || undefined);

  return NextResponse.json({}, { headers: corsHeaders });
}
