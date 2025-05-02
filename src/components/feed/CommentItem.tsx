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
  const { user } = useUser();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [likeCount, setLikeCount] = useState(comment?.like_count || 0);
  const [isLiked, setIsLiked] = useState(() => {
    if (!user) return false;
    return comment?.likes?.some((u) => u.id === user.id) || false;
  });

  const { toast } = useToast();

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to reply to a comment.",
        variant: "warning",
      });
      return;
    }

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
        onUpdateComment(updatedComment, true);

        toast({
          title: "Reply submitted",
          description: "Your reply has been posted.",
          variant: "success",
        });

        setReplyText("");
        setShowReplyBox(false);
      } catch (error) {
        console.error("Error submitting reply:", error);
      }
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to like a comment.",
        variant: "warning",
      });
      return;
    }

    const token = user?.access || localStorage.getItem("access") || "";
    try {
      await apiService.post(`/posts/comment/${comment.id}/like/`, null, token);

      const updatedLikedBy = isLiked
        ? comment?.likes?.filter((u) => u.id !== user.id)
        : [...(comment?.likes || []), user];

      const updatedComment = {
        ...comment,
        liked_by: updatedLikedBy,
        like_count: isLiked ? likeCount - 1 : likeCount + 1,
      };

      onUpdateComment(updatedComment);

      toast({
        title: isLiked ? "Unliked" : "Liked",
        description: `You have ${isLiked ? "unliked" : "liked"} this comment.`,
        variant: isLiked? "default" : "success",
      });

      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  return (
    <div
      className={clsx(
        "relative pl-4 border-l border-gray-300 ml-2 mt-2",
        level === 0 && "border-none pl-0"
      )}
    >
      <div className="flex items-start space-x-2">
        <Avatar className="h-8 w-8 shrink-0">
          <img
            src={comment?.created_by?.profile?.profile_picture}
            alt={comment?.created_by?.profile?.full_name}
          />
        </Avatar>
        <div
          className={clsx(
            "bg-gray-100 px-4 py-2 rounded-2xl max-w-[85%]",
            level > 0 && "bg-gray-200"
          )}
        >
          <Link
            to={`/profile/${comment?.created_by?.id}`}
            className="text-sm font-semibold hover:underline"
          >
            {comment?.created_by?.profile?.full_name}
          </Link>
          <p className="text-sm">{comment?.content}</p>

          <div className="flex gap-4 mt-1 text-xs text-muted-foreground ml-1">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-1 transition hover:underline ${
                isLiked ? "text-facebook" : "text-gray-700"
              }`}
            >
              {isLiked ? (
                <>
                  <Heart className="h-4 w-4 fill-facebook text-facebook" />{" "}
                  Liked
                </>
              ) : (
                "Like"
              )}
            </button>
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:underline"
            >
              Reply
            </button>
            <span>{comment?.time_since_created}</span>
            <span>
              {likeCount > 0 && (
                <span className="ml-2 text-xs bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded-full">
                  👍 {likeCount}
                </span>
              )}
            </span>
          </div>

          {showReplyBox && (
            <form
              onSubmit={handleReplySubmit}
              className="flex mt-2 items-start space-x-2"
            >
              <Avatar className="h-6 w-6 mt-1">
                <img src={user?.profile_pic} alt="Current user" />
              </Avatar>
              <div className="flex-1 relative ">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-0 h-8 py-1 px-3 resize-none text-sm rounded-full bg-gray-100"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="h-8 px-3 text-sm text-facebook-light"
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </form>
          )}
        </div>
      </div>

      {comment?.replies?.length > 0 && (
        <div className="mt-2">
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
