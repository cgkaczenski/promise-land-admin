import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { getCorsHeaders, handleCors } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleCors(req);
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds, quantities, phone } = await req.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  if (!quantities || quantities.length !== productIds.length) {
    return new NextResponse("Invalid quantities", { status: 400 });
  }

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product, index) => {
    if (!product.priceId) {
      throw new Error(`Product ${product.id} doesn't have a Stripe priceId`);
    }

    line_items.push({
      quantity: quantities[index],
      price: product.priceId,
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      ...(phone ? { phone } : {}),
      orderItems: {
        create: productIds.map((productId: string, index: number) => ({
          product: {
            connect: {
              id: productId,
            },
          },
          quantity: quantities[index],
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: "subscription",
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    payment_method_types: ["card", "us_bank_account"],
    metadata: {
      orderId: order.id,
      ...(phone ? { phone } : {}), // Also add phone to Stripe metadata if provided
    },
    payment_method_options: {
      us_bank_account: {
        financial_connections: {
          permissions: ["payment_method"],
        },
      },
    },
  });

  const corsHeaders = getCorsHeaders(req.headers.get("origin") || undefined);

  return NextResponse.json(
    { url: session.url },
    {
      headers: corsHeaders,
    }
  );
}
