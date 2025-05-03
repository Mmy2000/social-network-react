import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCard from "@/components/feed/PostCard";
import axios from "axios"; // or use fetch if you prefer
import apiService from "@/apiService/apiService";
import RightSidebar from "@/components/layout/RightSidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { Spinner } from "@/components/ui/Spinner";
import { Loader2 } from "lucide-react";

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await apiService.get(`/posts/${id}`); // Adjust your endpoint
        console.log(response);
        
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const updatePostById = (updatedPost: any) => {
    setPost(updatedPost);
  };

  if (!post) return (
    <div className="flex items-center justify-center mt-5">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
