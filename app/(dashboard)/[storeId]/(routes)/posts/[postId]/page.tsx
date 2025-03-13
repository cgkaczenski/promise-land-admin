import prismadb from "@/lib/prismadb";

import { PostForm } from "./components/post-form";

const PostPage = async ({
  params,
}: {
  params: { postId: string; storeId: string };
}) => {
  const post = await prismadb.post.findUnique({
    where: {
      id: params.postId,
    },
    include: {
      images: true,
    },
  });

  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PostForm categories={categories} initialData={post} />
      </div>
    </div>
  );
};

export default PostPage;
