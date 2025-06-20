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
    mutationFn: async ({ postId, reactionType }: { postId: number; reactionType: string }) => {
      console.log(postId, reactionType);
      
      const response = await apiService.post(`/posts/${postId}/like/`, { reaction_type: reactionType }, getToken());
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate all posts queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      // Invalidate the specific post query
      queryClient.invalidateQueries({ queryKey: ["post", variables.postId.toString()] });
      
      // Invalidate profile posts if we're on a profile page
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      
      // Invalidate user feed
      queryClient.invalidateQueries({ queryKey: ["user-feed"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-posts"] });

      toast({
        title: "Success",
        description: "Reaction updated successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
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
    mutationFn: async ({ commentId, reactionType }: { commentId: number; reactionType: string }) => {
      const response = await apiService.post(`/posts/comment/${commentId}/like/`, { reaction_type: reactionType }, getToken());
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate all posts queries to update lists
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      // Invalidate the specific post query where this comment belongs
      if (data?.post_id) {
        queryClient.invalidateQueries({ queryKey: ["post", data.post_id.toString()] });
      }
      
      // Invalidate profile posts
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      
      // Invalidate user feed
      queryClient.invalidateQueries({ queryKey: ["user-feed"] });

      toast({
        title: "Success",
        description: "Reaction updated successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "error",
      });
    },
  });

  const sharePostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiService.postNewPost(
        `/posts/share/`,
        formData,
        user?.access
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-feed"] });
    },
  });

  // Save Post Mutation
  const savePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiService.post(
        `/posts/${postId}/save/`,
        {},
        user?.access
      );
      return response;
    },
    onSuccess: (_, postId) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-feed"] });
    },
  });

  // Add to Favorites Mutation
  const favoritePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiService.post(
        `/posts/${postId}/favorite/`,
        {},
        user?.access
      );
      return response;
    },
    onSuccess: (_, postId) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-feed"] });
    },
  });

  return {
    likeMutation,
    addCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
    likeCommentMutation,
    updatePostCache,
    sharePostMutation,
    savePostMutation,
    favoritePostMutation,
  };
}; 