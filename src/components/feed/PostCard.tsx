import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import CommentItem from "./CommentItem";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PostAttachmentsGrid from "./PostAttachmentsGrid ";
import PostOptionsDropdown from "../ui/PostOptionsDropdown";
import { usePost } from "@/hooks/usePost";
import Reactions, { REACTIONS } from "../reactions/Reactions";

const PostCard = ({ post, updatePost }) => {
  const location = useLocation();
  const isPostDetailPage = location.pathname.includes(`/post/${post?.id}`);
  const [liked, setLiked] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [showComments, setShowComments] = useState(isPostDetailPage);
  const [commentText, setCommentText] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const {
    likeMutation,
    addCommentMutation,
    likeCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
  } = usePost();
  const feelingEmojis = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    tired: "😴",
  };


  useEffect(() => {
    if (user && Array.isArray(post?.likes)) {
      setLiked(post.likes.some((likedUser) => likedUser.id === user.id));
    } else {
      setLiked(false);
    }
  }, [user, post?.likes]);

  useEffect(() => {
    setShowComments(isPostDetailPage);
  }, [isPostDetailPage]);

  const handleLike = async (reactionType) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to react to a post.",
        variant: "warning",
      });
      return;
    }

    try {
      await likeMutation.mutateAsync({ postId: post.id, reactionType });
      // Create a new reaction object
      const reaction = REACTIONS.find((r) => r.type === reactionType);
      const newReaction = {
        id: user.id, // Use actual user ID instead of timestamp
        username: user.username,
        image: user.profile_pic,
        reaction_type: reactionType,
        reaction_display: reaction?.emoji || "👍", // Use the actual emoji from REACTIONS
      };

      // If user already reacted, update their reaction, otherwise add new reaction
      const existingReactionIndex = post.likes.findIndex(
        (like) => like.id === user.id
      );
      let updatedLikes;

      if (existingReactionIndex !== -1) {
        // Update existing reaction
        updatedLikes = [...post.likes];
        updatedLikes[existingReactionIndex] = newReaction;
      } else {
        // Add new reaction
        updatedLikes = [...post.likes, newReaction];
      }

      // Update post state
      updatePost(post.id, {
        like_count: updatedLikes.length,
        likes: updatedLikes,
      });

      setLiked(true);
    } catch (error) {
      console.error("Failed to update reaction:", error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "error",
      });
    }
  };

  const handleComment = async (e) => {
    setLoadingComment(true);
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to comment on a post.",
        variant: "warning",
      });
      return;
    }

    if (!commentText.trim()) return;

    try {
      const newComment = await addCommentMutation.mutateAsync({
        postId: post.id,
        content: commentText,
      });

      // Update the post with the new comment
      updatePost(post.id, {
        comments: [...post.comments, newComment],
        comments_count: post.comments_count + 1,
      });

      setCommentText("");
      setShowComments(true); // Show comments section after adding a comment
    } catch (error) {
      console.error("Failed to post comment", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "error",
      });
    } finally {
      setLoadingComment(false);
    }
  };

  const handleUpdateComment = async (updatedComment, shouldAdd = true) => {
    const newComments = updateComments(
      post.comments,
      updatedComment,
      shouldAdd
    );
    let newCount = post.comments_count;

    if (!shouldAdd) {
      newCount = Math.max(0, newCount - 1);
    } else if (
      shouldAdd &&
      !post.comments.some((c) => c.id === updatedComment.id)
    ) {
      newCount += 1;
    }

    updatePost(post.id, {
      ...post,
      comments: newComments,
      comments_count: newCount,
    });
  };

  const updateComments = (comments, updatedComment, shouldAdd = true) => {
    return comments
      .map((comment) => {
        if (comment.id === updatedComment.id) {
          return shouldAdd ? updatedComment : null;
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateComments(comment.replies, updatedComment, shouldAdd),
          };
        }
        return comment;
      })
      .filter(Boolean);
  };

  const getReactionEmoji = (reactionType) => {
    const reaction = REACTIONS.find((r) => r.type === reactionType);
    return reaction ? reaction.emoji : null;
  };

  console.log(post);

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

              <p className="text-xs text-gray-500">
                {post?.time_since_created}
              </p>
            </div>
          </div>
          <div className="relative">
            {user?.id === post?.created_by?.id && (
              <PostOptionsDropdown post={post} updatePost={updatePost} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Link to={`/post/${post?.id}`}>
          <p className="text-sm mb-3">{post?.content}</p>
        </Link>
        <PostAttachmentsGrid attachments={post?.attachments} />

        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            {post?.likes
              ?.filter(
                (like, index, self) =>
                  self.findIndex(
                    (l) => l.reaction_display === like.reaction_display
                  ) === index
              )
              .map((like) => (
                <div key={like?.reaction_display} className="mr-0">
                  {like?.reaction_display}
                </div>
              ))}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mr-4 text-gray-700 cursor-pointer">
                    <span>
                      {post?.like_count > 0
                        ? `${post?.like_count} Reactions`
                        : "0 Reactions"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex flex-col">
                    {Array.isArray(post?.likes) &&
                      post.likes.map((like) => (
                        <Link
                          key={like?.id}
                          to={`/profile/${like?.id}`}
                          className="flex items-center space-x-2 mb-1 hover:underline"
                        >
                          <Avatar className="h-6 w-6">
                            <img src={like?.image} alt={like?.username} />
                          </Avatar>
                          <span className="text-sm text-gray-700">
                            {like?.username} {like?.reaction_display}
                          </span>
                        </Link>
                      ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          <Reactions
            type="post"
            likes={post?.likes || []}
            likeCount={post?.like_count || 0}
            onReact={handleLike}
            selectedReaction={
              liked && post?.likes?.length > 0
                ? post.likes.find((like) => like.id === user?.id)
                    ?.reaction_display
                : undefined
            }
          />

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
            <div className="flex-1 relative border-0 outline-none">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-0 h-10 py-2 resize-none bg-white "
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 bottom-1 text-facebook h-8 p-0 bg-transparent hover:bg-transparent"
                disabled={!commentText.trim() || loadingComment}
              >
                {loadingComment ? (
                  <Loader className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Post
              </Button>
            </div>
          </form>

          {/* Render comments */}
          <div className="space-y-3 ">
            {post?.comments.map((comment) => (
              <CommentItem
                key={comment?.id}
                comment={comment}
                post={post}
                updatePost={updatePost}
                onUpdateComment={handleUpdateComment}
                level={0}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
