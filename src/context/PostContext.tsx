// context/PostContext.js
import React, { createContext, useContext } from "react";
import apiService from "@/apiService/apiService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "./UserContext";
import { set } from "date-fns";

const PostContext = createContext<any>(null);

export const PostProvider = ({ children }) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [newPosts, setNewPosts] = React.useState(null);
  const [comments, setComments] = React.useState(null);
  const [likes, setLikes] = React.useState(null);
  const [updated , setUpdated] = React.useState(false);

  const [loading, setLoading] = React.useState(false);

  const handleLike = async (post, liked, updatePost) => {
    try {
      const token = user?.access || localStorage.getItem("access") || "";
      const res = await apiService.post(`/posts/${post.id}/like/`, null, token);

      const updatedPost = res?.data?.data?.find((p) => p.id === post.id);
      if (updatedPost && updatePost) {
        updatePost(post.id, updatedPost); // 👈 Update cached post directly
      }
      setUpdated(true);

      toast({
        title: liked ? "Unliked" : "Liked",
        description: `You have ${liked ? "unliked" : "liked"} this post.`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to like/unlike the post", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike the post.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    console.log("Updated posts:", newPosts);
    console.log("Updated comments:", comments);
    console.log("Updated likes:", likes);
  }, [newPosts, comments, likes]);

  const handleComment = async (postId, commentText, updatePost, onSuccess) => {
    const token = user?.access || localStorage.getItem("access") || "";
    try {
      const res = await apiService.post(
        `/posts/${postId}/comment/`,
        { content: commentText },
        token
      );

      updatePost(postId, (prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, res.data],
        comments_count: prevPost.comments_count + 1,
      }));

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
        duration: 2000,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  return (
    <PostContext.Provider value={{ handleLike, handleComment, newPosts, setNewPosts,updated, setUpdated }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
