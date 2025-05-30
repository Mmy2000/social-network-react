import React from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import apiService from "@/apiService/apiService";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";

const fetchPosts = async (token?: string) => {
  try {
    // Try to fetch posts with token if available
    if (token) {
      const response = await apiService.get("/posts/", token);
      if (response.status_code === 200) {
        return response.data;
      }
    }

    // If no token or token request failed, fetch without token
    const response = await apiService.getWithoutToken("/posts/");
    if (response.status_code === 200) {
      return response.data;
    }

    throw new Error("Failed to fetch posts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

const Feed: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts", user?.access],
    queryFn: () => fetchPosts(user?.access),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  const updatePostById = (postId: string, updatedData: any) => {
    // Update the post in the posts list cache
    queryClient.setQueryData(
      ["posts", user?.access],
      (oldPosts: any[] = []) => {
        if (!updatedData) {
          // Post was deleted – remove it from the list
          return oldPosts.filter((post) => post.id !== postId);
        }
        // Post was updated – update it in the list
        return oldPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedData } : post
        );
      }
    );

    // Also update the individual post cache if it exists
    queryClient.setQueryData(["post", postId], (oldPost: any) => {
      if (!updatedData) return null;
      return { ...oldPost, ...updatedData };
    });
  };

  const handleNewPost = () => {
    // Invalidate and refetch posts query
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-5">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5 text-red-500">Failed to load posts.</div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <CreatePostCard onPostCreated={handleNewPost} />
      <div className="space-y-4">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} updatePost={updatePostById} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
