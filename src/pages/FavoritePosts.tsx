import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes: any[];
  comments: any[];
  attachments: any[];
  created_by: any;
  [key: string]: any;
}

const FavoritePosts = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["favorite-posts"],
    queryFn: async () => {
      const response = await apiService.get("/posts/favorites/", user?.access);
      return response.data;
    },
    enabled: !!user?.access,
  });

  const updatePost = (postId: string, updatedData: Partial<Post>) => {
    // Get the current posts from the cache
    const currentPosts = queryClient.getQueryData<Post[]>(["favorite-posts"]);

    if (currentPosts) {
      // Update the specific post in the cached data
      const updatedPosts = currentPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      );

      // Update the cache with the new data
      queryClient.setQueryData(["favorite-posts"], updatedPosts);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-5">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Favorite Posts</h1>
          <p className="text-gray-500">
            You haven't added any posts to favorites yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-semibold mb-6">Favorite Posts</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} updatePost={updatePost} />
        ))}
      </div>
    </div>
  );
};

export default FavoritePosts;
