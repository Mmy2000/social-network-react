import React, { useEffect, useState } from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import apiService from "@/apiService/apiService";

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiService.getWithoutToken("/posts/");
        if (response.status_code === 200) {
          setPosts(response?.data);
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleNewPost = () => {
    apiService.get("/posts/").then((response) => {
      if (response.status_code === 200) {
        setPosts(response?.data);
      }
    });
  };

  const updatePostById = (postId, updatedData) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, ...updatedData } : p))
    );
  };

  return (
    <div className="max-w-xl mx-auto py-4">
      <CreatePostCard onPostCreated={handleNewPost} />
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} updatePost={updatePostById} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
