import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { getCorsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleCors(req);
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
    });

    const corsHeaders = getCorsHeaders(req.headers.get("origin") || undefined);
    return NextResponse.json(store, { headers: corsHeaders });
  } catch (error) {
    console.log("[STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
