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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmModal from "../modal/ConfirmModal";
import { usePost } from "@/hooks/usePost";
import Reactions, { REACTIONS } from "../reactions/Reactions";

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

  const handleLikeToggle = async (reactionType: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to like a comment.",
        variant: "warning",
      });
      return;
    }

    try {
      await likeCommentMutation.mutateAsync({
        commentId: comment.id,
        reactionType: reactionType,
      });

      // Create a new reaction object
      const reaction = REACTIONS.find((r) => r.type === reactionType);
      const newReaction = {
        id: user.id,
        username: user.username,
        image: user.profile_pic,
        reaction_type: reactionType,
        reaction_display: reaction?.emoji || "👍",
      };

      // Check if user already has a reaction
      const existingReactionIndex = comment.likes.findIndex(
        (like) => like.id === user.id
      );

      // Check if clicking the same reaction (to remove it)
      const isRemovingReaction =
        existingReactionIndex !== -1 &&
        comment.likes[existingReactionIndex].reaction_type === reactionType;

      let updatedLikes;
      let newLikeCount;

      if (isRemovingReaction) {
        // Remove the reaction
        updatedLikes = comment.likes.filter((like) => like.id !== user.id);
        newLikeCount = comment.like_count - 1;
        setIsLiked(false);
      } else if (existingReactionIndex !== -1) {
        // Update existing reaction
        updatedLikes = [...comment.likes];
        updatedLikes[existingReactionIndex] = newReaction;
        newLikeCount = comment.like_count; // Keep the same count when updating
        setIsLiked(true);
      } else {
        // Add new reaction
        updatedLikes = [...comment.likes, newReaction];
        newLikeCount = comment.like_count + 1;
        setIsLiked(true);
      }

      const updatedComment = {
        ...comment,
        likes: updatedLikes,
        like_count: newLikeCount,
      };

      onUpdateComment(updatedComment);
      setLikeCount(newLikeCount);
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

  console.log(comment);

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

            <div className="flex gap-4 items-center justify-start mt-1 text-xs text-muted-foreground ml-1">
              
              <Reactions
                type="comment"
                likes={comment?.likes || []}
                likeCount={comment?.like_count || 0}
                onReact={handleLikeToggle}
                selectedReaction={
                  comment?.likes?.find((like) => like.id === user?.id)
                    ?.reaction_display
                }
              />
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="hover:underline"
              >
                Reply
              </button>
              <span>{comment?.time_since_created}</span>
              {likeCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 text-xs bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded-full cursor-pointer">
                        {comment?.likes
                          ?.filter(
                            (like, index, self) =>
                              self.findIndex(
                                (l) =>
                                  l.reaction_display === like.reaction_display
                              ) === index
                          )
                          .map((like) => like.reaction_display)
                          .join("")}{" "}
                        {likeCount}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-white p-2 shadow-lg"
                    >
                      <div className="flex flex-col gap-1">
                        {Array.isArray(comment?.likes) &&
                          comment.likes.map((like) => (
                            <Link
                              key={like?.id}
                              to={`/profile/${like?.id}`}
                              className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded transition-colors"
                            >
                              <Avatar className="h-6 w-6">
                                <img src={like?.image} alt={like?.username} />
                              </Avatar>
                              <span className="text-sm font-medium">
                                {like?.username}
                              </span>
                              <span className="text-sm ml-auto opacity-70">
                                {like?.reaction_display}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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
