import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { PostsClient } from "./components/client";
import { PostColumn } from "./components/columns";

const PostsPage = async ({ params }: { params: { storeId: string } }) => {
  const posts = await prismadb.post.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedPosts: PostColumn[] = posts.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    category: item.category.name,
    date: item.date ? format(item.date, "MMMM do, yyyy") : "N/A",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PostsClient data={formattedPosts} />
      </div>
    </div>
  );
};

export default PostsPage;
