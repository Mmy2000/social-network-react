import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";
import { Heart, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ConfirmModal from "../modal/ConfirmModal";
import { usePost } from "@/hooks/usePost";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.content || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const {
    addCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
    likeCommentMutation,
  } = usePost();

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

    if (!replyText.trim()) return;

    try {
      const newComment = await addCommentMutation.mutateAsync({
        postId: post.id,
        content: replyText,
        parentId: comment.id,
      });

      const updatedComment = {
        ...comment,
        replies: [...(comment.replies || []), newComment],
      };
      onUpdateComment(updatedComment, true);

      setReplyText("");
      setShowReplyBox(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
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

    try {
      await likeCommentMutation.mutateAsync(comment.id);

      const updatedLikedBy = isLiked
        ? comment?.likes?.filter((u) => u.id !== user.id)
        : [...(comment?.likes || []), user];

      const updatedComment = {
        ...comment,
        liked_by: updatedLikedBy,
        like_count: isLiked ? likeCount - 1 : likeCount + 1,
      };

      onUpdateComment(updatedComment);
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const confirmDelete = async () => {
    if (!user) return;
    setIsDeleting(true);

    try {
      await deleteCommentMutation.mutateAsync(comment.id);
      onUpdateComment(comment, false);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedComment = await editCommentMutation.mutateAsync({
        commentId: comment.id,
        content: editText,
      });

      onUpdateComment({ ...comment, content: updatedComment.content });
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "relative pl-4 border-l border-gray-300 ml-2 mt-2",
          level === 0 && "border-none pl-0"
        )}
      >
        <div className="flex items-start space-x-2 relative">
          <Avatar className="h-8 w-8 shrink-0">
            <img
              src={comment?.created_by?.profile?.profile_picture}
              alt={comment?.created_by?.profile?.full_name}
            />
          </Avatar>
          <div
            className={clsx(
              "bg-gray-100 px-4 py-2 rounded-2xl max-w-[85%] w-full relative",
              level > 0 && "bg-gray-200"
            )}
          >
            <div className="absolute top-1 right-1">
              {user?.id === comment?.created_by?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <Link
              to={`/profile/${comment?.created_by?.id}`}
              className="text-sm font-semibold hover:underline"
            >
              {comment?.created_by?.profile?.full_name}
            </Link>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-1 mt-1">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2 mt-1">
                  <Button size="sm" type="submit" className="text-xs">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.content);
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="text-sm mt-1">{comment?.content}</p>
            )}

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
                <div className="flex-1 relative">
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
            {comment.replies.map((reply) => (
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
      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Comment"
        content="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={confirmDelete}
        loading={isDeleting}
        children={undefined}
      />
    </>
  );
};

export default CommentItem;
