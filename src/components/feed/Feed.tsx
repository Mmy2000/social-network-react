import React from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import apiService from "@/apiService/apiService";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";


const fetchPosts = async () => {
  const response = await apiService.getWithoutToken("/posts/");
  if (response.status_code !== 200) {
    throw new Error("Failed to fetch posts");
  }
  return response.data;
};

const Feed: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: posts = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    refetchInterval: 60000,
  });

 const updatePostById = (postId, updatedData) => {
   queryClient.setQueryData(
     ["posts"],
     (oldPosts: Array<{ id: string }> = []) => {
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
 };

  
  const handleNewPost = () => {
    refetch(); // Re-fetch posts after new post is created
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
      <CreatePostCard
        onPostCreated={handleNewPost}
      />
      <div className="space-y-4">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} updatePost={updatePostById} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
