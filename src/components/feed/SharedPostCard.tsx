import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import PostAttachmentsGrid from "./PostAttachmentsGrid ";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
interface SharedPostCardProps {
  postID: any; // Replace with proper type when available
}

const SharedPostCard: React.FC<SharedPostCardProps> = ({ postID }) => {
  const { user } = useUser();
  if (!postID) return null;
  const feelingEmojis = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    tired: "😴",
  };
  const queryClient = useQueryClient();
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postID],
    queryFn: async () => {
      if (user?.access) { 
        const response = await apiService.get(`/posts/${postID}`, user.access);
        return response.data;
      }
      const response = await apiService.getWithoutToken(`/posts/${postID}`);
      return response.data;
    },
    enabled: !!postID,
  });

  return (
    <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
      <div className="p-4">
        <div className="flex items-center mb-2">
          <Link to={`/profile/${post?.created_by?.id}`}>
            <Avatar className="h-8 w-8 mr-2">
              <img
                src={post?.created_by?.profile?.profile_picture}
                alt={post?.created_by?.profile?.full_name}
              />
            </Avatar>
          </Link>
          <div>
            <Link
              to={`/profile/${post?.created_by?.id}`}
              className="font-medium hover:underline text-sm"
            >
              {post?.created_by?.profile?.full_name}
            </Link>
            {post?.feeling && (
              <>
                <span className="text-muted-foreground text-xs font-normal">
                  {" "}
                  —{" "}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-md text-muted-foreground text-xs font-normal">
                  {feelingEmojis[post.feeling]} feeling {post.feeling}
                </span>
              </>
            )}
            <p className="text-xs text-gray-500">{post?.time_since_created}</p>
          </div>
        </div>

        <Link to={`/post/${post?.id}`}>
          <p className="text-sm text-gray-700 mb-2">{post?.content}</p>
        </Link>

        {post?.attachments && post.attachments.length > 0 && (
          <div className="mt-2 bg-red-600">
            <PostAttachmentsGrid attachments={post.attachments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPostCard;
