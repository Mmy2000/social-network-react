import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { useUser } from "@/context/UserContext";
import CommentItem from "./CommentItem";
import apiService from "@/apiService/apiService";
import { useToast } from "@/hooks/use-toast";


const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useUser();
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      const token = user?.access || localStorage.getItem("access") || "";
      const response = await apiService.post(`/posts/${post.id}/like/`, null, token); // pass token explicitly
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
      toast({
        title: liked ? "Unliked" : "Liked",
        description: `You have ${liked ? "unliked" : "liked"} this post.`,
        duration: 2000,
      });
      console.log("liked post", response);
      
    } catch (error) {
      console.error("Failed to like/unlike the post", error);
      toast({
        title: "Error",
        description: "Failed to like/unlike the post.",
        variant: "destructive",
      });
    }
  };


  const handleComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      console.log("New comment:", commentText); // TODO: connect to API
      setCommentText("");
    }
  };

  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Link to={`/profile/${post?.created_by?.id}`}>
              <Avatar className="h-10 w-10 mr-3">
                <img
                  src={post?.created_by?.profile?.profile_picture}
                  alt={post?.created_by?.profile?.full_name}
                />
              </Avatar>
            </Link>
            <div>
              <Link
                to={`/profile/${post?.created_by?.id}`}
                className="font-medium hover:underline"
              >
                {post?.created_by?.profile?.full_name}
              </Link>
              <p className="text-xs text-gray-500">{post.time_since_created}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <p className="text-sm mb-3">{post?.content}</p>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            {liked && (
              <div className="bg-facebook rounded-full p-1 mr-1">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
            )}
            <span>{likeCount > 0 ? `${likeCount} likes` : "0 likes"}</span>
          </div>
          <div>
            {post?.comments_count > 0 ? (
              <Button
                variant="ghost"
                className="h-auto p-0 text-gray-500 hover:text-gray-700"
                onClick={() => setShowComments(!showComments)}
              >
                {post?.comments_count} comments
              </Button>
            ) : (
              "0 comments"
            )}
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="p-1">
        <div className="flex w-full">
          <Button
            variant="ghost"
            className="flex-1 rounded-none"
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 mr-2 ${
                liked ? "text-facebook fill-facebook" : ""
              }`}
            />
            Like
          </Button>

          <Button
            variant="ghost"
            className="flex-1 rounded-none"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>

          <Button variant="ghost" className="flex-1 rounded-none">
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>

      {showComments && (
        <div className="px-4 py-3 bg-gray-50">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <img src={user?.profile_pic} alt="Current user" />
            </Avatar>
            <div className="flex-1 relative">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-0 h-10 py-2 resize-none bg-white"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 bottom-1 text-facebook h-8 p-0 bg-transparent hover:bg-transparent"
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          </form>

          {/* Render top-level comments */}
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} level={0} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
