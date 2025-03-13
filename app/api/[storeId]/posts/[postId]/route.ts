import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    const post = await prismadb.post.findUnique({
      where: {
        id: params.postId,
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const post = await prismadb.post.delete({
      where: {
        id: params.postId,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const {
      name,
      description,
      date,
      categoryId,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.postId) {
      return new NextResponse("Post id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    await prismadb.post.update({
      where: {
        id: params.postId,
      },
      data: {
        name,
        description,
        categoryId,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
        date: date ? new Date(date) : undefined,
      },
    });

    const post = await prismadb.post.update({
      where: {
        id: params.postId,
      },
      data: {
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => ({
                url: image.url,
              })),
            ],
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POST_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
