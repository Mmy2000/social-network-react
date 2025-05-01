// CommentItem.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";
import apiService from "@/apiService/apiService";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CommentItem = ({
  comment,
  level = 0,
  post,
  updatePost,
  onUpdateComment,
}) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [likeCount, setLikeCount] = useState(comment?.like_count || 0);
  const [isLiked, setIsLiked] = useState(comment?.is_liked_by_user || false);
  const { user } = useUser();
  const { toast } = useToast();

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      try {
        const token = user?.access || localStorage.getItem("access") || "";
        const res = await apiService.post(
          `/posts/${post.id}/comment/`,
          { content: replyText, parent: comment.id },
          token
        );

        const updatedComment = {
          ...comment,
          replies: [...(comment.replies || []), res.data],
        };
        onUpdateComment(updatedComment); // Trigger UI update in PostCard

        toast({
          title: "Reply submitted",
          description: "Your reply has been submitted successfully.",
        });
      } catch (error) {
        console.error("Error submitting reply:", error);
      }
      setReplyText("");
      setShowReplyBox(false);
    }
  };


  const handleLikeToggle = async () => {
    const token = user?.access || localStorage.getItem("access") || "";
    try {
      await apiService.post(`/posts/comment/${comment.id}/like/`, null, token);
      toast({
        title: isLiked ? "Unliked" : "Liked",
        description: `You have ${isLiked ? "unliked" : "liked"} this comment.`,
      });
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div className="relative pl-4 border-l border-gray-300 ml-3">
      <div className="flex items-start space-x-2 mt-3 relative">
        <div className="w-8 h-8 shrink-0">
          <Avatar className="h-8 w-8">
            <img
              src={comment?.created_by?.profile?.profile_picture}
              alt={comment?.created_by?.profile?.full_name}
            />
          </Avatar>
        </div>
        <div
          className={clsx(
            "bg-white px-3 py-2 rounded-md shadow-sm",
            level > 0 && "bg-gray-50"
          )}
        >
          <Link
            to={`/profile/${comment?.created_by.id}`}
            className="text-sm font-semibold hover:underline"
          >
            {comment?.created_by?.profile?.full_name}
          </Link>
          <p className="text-sm">{comment?.content}</p>

          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center px-2 py-1 rounded-full text-sm font-medium transition ${
                isLiked ? " text-facebook" : " text-gray-700"
              }`}
            >
              {isLiked ? (
                <>
                  <Heart className="h-4 w-4 mr-1 fill-facebook text-facebook" />{" "}
                  Liked
                </>
              ) : (
                "Like"
              )}
            </button>
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:underline"
            >
              Reply
            </button>
            <span>{comment?.time_since_created}</span>
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="flex mt-2 space-x-2">
              <Avatar className="h-6 w-6 mt-1">
                <img src={user?.profile_pic} alt="Current user" />
              </Avatar>
              <div className="flex-1 relative">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-0 h-8 py-1 resize-none text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 bottom-1 text-facebook h-7 px-2 bg-transparent hover:bg-transparent"
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment?.replies?.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {comment?.replies.map((reply) => (
            <CommentItem
              key={reply?.id}
              comment={reply}
              post={post}
              updatePost={updatePost}
              onUpdateComment={onUpdateComment}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
