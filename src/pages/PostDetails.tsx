import React from "react";
import { useParams } from "react-router-dom";
import PostCard from "@/components/feed/PostCard";
import apiService from "@/apiService/apiService";
import RightSidebar from "@/components/layout/RightSidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await apiService.get(`/posts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const updatePostById = (postId: string, updatedData: any) => {
    // Update both the post details cache and the posts list cache
    queryClient.setQueryData(["post", id], (oldPost: any) => {
      if (!updatedData) return null; // Post was deleted
      return { ...oldPost, ...updatedData };
    });

    // Also update the post in the posts list if it exists
    queryClient.setQueryData(["posts"], (oldPosts: any[] = []) => {
      if (!updatedData) {
        return oldPosts.filter((p) => p.id !== postId);
      }
      return oldPosts.map((p) =>
        p.id === postId ? { ...p, ...updatedData } : p
      );
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center mt-5">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );

  if (!post)
    return (
      <div className="flex items-center justify-center mt-5">
        <p className="text-red-500">Post not found</p>
      </div>
    );

  return (
    <>
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex">
          <LeftSidebar />
          <main className="flex-1 py-4 px-2">
            <PostCard key={post.id} post={post} updatePost={updatePostById} />
          </main>
          <RightSidebar />
        </div>
      </div>
    </>
  );
};

export default PostDetails;
