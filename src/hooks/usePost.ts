import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

interface PostComment {
  id: number;
  content: string;
  parent?: number;
}

interface Post {
  id: number;
  content: string;
  comments: PostComment[];
  comments_count: number;
  likes: any[];
  like_count: number;
}

export const usePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();

  // Helper function to get token
  const getToken = () => user?.access || localStorage.getItem("access") || "";

  // Helper function to update post cache
  const updatePostCache = (postId: string | number, updatedData: Partial<Post>) => {
    // Update in posts list
    queryClient.setQueryData(["posts", user?.access], (oldPosts: Post[] = []) => {
      return oldPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      );
    });

    // Update individual post if it exists
    queryClient.setQueryData(["post", postId.toString()], (oldPost: Post | undefined) => {
      if (!oldPost) return oldPost;
      return { ...oldPost, ...updatedData };
    });
  };

  // Like/Unlike Post Mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiService.post(`/posts/${postId}/like/`, null, getToken());
      return response.data;
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId.toString()] });
      toast({
        title: "Success",
        description: "Post like status updated",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "error",
      });
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: number; content: string; parentId?: number }) => {
      const response = await apiService.post(
        `/posts/${postId}/comment/`,
        { content, parent: parentId },
        getToken()
      );
      return response.data;
    },
    onSuccess: (newComment, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId.toString()] });
      toast({
        title: "Success",
        description: "Comment added successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "error",
      });
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiService.delete(`/posts/comment/${commentId}/delete/`, getToken());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "error",
      });
    },
  });

  // Edit Comment Mutation
  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const response = await apiService.put(
        `/posts/comment/${commentId}/update/`,
        { content },
        getToken()
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Comment updated successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "error",
      });
    },
  });

  // Like Comment Mutation
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiService.post(`/posts/comment/${commentId}/like/`, null, getToken());
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Comment like status updated",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update comment like status",
        variant: "error",
      });
    },
  });

  return {
    likeMutation,
    addCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
    likeCommentMutation,
    updatePostCache,
  };
}; 