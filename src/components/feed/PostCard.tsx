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
import SharedPostCard from "./SharedPostCard";
import SharePostModal from "../modal/SharePostModal";
import { useQueryClient } from "@tanstack/react-query";

interface IPost {
  post:any;
  updatePost:any;
  groupId?:string;
  eventId?:string;
}

const PostCard = ({ post, updatePost, groupId, eventId }:IPost) => {

  const location = useLocation();
  const isPostDetailPage = location.pathname.includes(`/post/${post?.id}`);
  const [liked, setLiked] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [showComments, setShowComments] = useState(isPostDetailPage);
  const [commentText, setCommentText] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    likeMutation,
    addCommentMutation,
    likeCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
    sharePostMutation,
  } = usePost();
  const feelingEmojis = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    tired: "😴",
  };
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (user && Array.isArray(post?.likes)) {
      setLiked(post.likes.some((likedUser) => likedUser.id === user.id));
    } else {
      setLiked(false);
    }
    // Always invalidate ["posts"] if groupId is falsy (e.g., feed page)
    const queryKey = groupId
      ? ["posts", groupId]
      : eventId
      ? ["posts", eventId]
      : ["posts"];

    // Invalidate the query so React Query refetches data
    queryClient.invalidateQueries({ queryKey });
  }, [user, post?.likes, groupId, eventId]);


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

  const handleShare = async (shareData: {
    content: string;
    feeling: string;
    role: string;
    originalPostId: string;
  }) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to share a post.",
        variant: "warning",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("shared_post_id", shareData.originalPostId);
      formData.append("content", shareData.content);
      formData.append("feeling", shareData.feeling);
      formData.append("role", shareData.role);

      await sharePostMutation.mutateAsync(formData);
      toast({
        title: "Post shared",
        description: "The post has been shared to your profile.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to share post:", error);
      toast({
        title: "Error",
        description: "Failed to share the post. Please try again.",
        variant: "error",
      });
      throw error;
    }
  };  

  return (
    <>
      <Card className="mb-4 shadow-sm overflow-hidden dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between">
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
                  className="font-medium hover:underline dark:text-gray-400"
                >
                  {post?.created_by?.profile?.full_name}
                </Link>

                {post?.feeling && (
                  <>
                    <span className="text-muted-foreground text-xs font-normal dark:text-gray-400">
                      {" "}
                      —{" "}
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded-md text-muted-foreground text-xs font-normal dark:text-gray-400">
                      {feelingEmojis[post.feeling]} feeling {post.feeling}
                    </span>
                  </>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {post?.time_since_created}
                </p>
              </div>
            </div>
            <div className="relative">
              <PostOptionsDropdown post={post} updatePost={updatePost} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {/* Post content */}
          <Link to={`/post/${post?.id}`}>
            <p className="text-sm mb-3 dark:text-gray-400">{post?.content}</p>
          </Link>

          {/* Original post attachments */}
          {!post?.shared_from && post?.attachments && (
            <PostAttachmentsGrid attachments={post?.attachments} />
          )}

          {/* Shared post */}
          {post?.shared_from && <SharedPostCard postID={post.shared_from} />}

          {/* Rest of the post content */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
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
                    <div className="mr-4 text-gray-700 cursor-pointer dark:text-gray-400">
                      <span>
                        {post?.like_count > 0
                          ? `${post?.like_count} Reactions`
                          : "0 Reactions"}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="dark:bg-gray-800 dark:text-gray-400 dark:border-gray-800 dark:hover:text-gray-300">
                    <div className="flex flex-col ">
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
                            <span className="text-sm text-gray-700 dark:text-gray-400">
                              {like?.username} {like?.reaction_display}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              {post?.comments_count > 0 ? (
                <Button
                  variant="ghost"
                    className="h-auto p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-800 "
                  onClick={() => setShowComments(!showComments)}
                >
                  {post?.comments_count} comments
                </Button>
              ) : (
                "0 comments"
              )}
              {post?.share_count > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                    <span className="font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      {post?.share_count} shares
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="dark:bg-gray-800 dark:text-gray-400 dark:border-gray-800 dark:hover:text-gray-300">
                    <div className="flex flex-col">
                      {post?.shared_users.map((share) => (
                        <Link
                          key={share?.id}
                          to={`/profile/${share?.id}`}
                          className="flex items-center space-x-2 mb-1 hover:underline"
                        >
                          <Avatar className="h-6 w-6">
                            <img src={share?.image} alt={share?.username} />
                          </Avatar>
                          <span className="text-sm text-gray-700 dark:text-gray-400">
                            {share?.username}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardContent>

        <Separator className="dark:bg-gray-700" />

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
              className="flex-1 rounded-none dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Comment
            </Button>

            <Button
              variant="ghost"
              className="flex-1 rounded-none dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={() => setIsShareModalOpen(true)}
              disabled={sharePostMutation.isPending}
            >
              <Share className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </CardFooter>

        {showComments && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
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
                  className="min-h-0 h-10 py-2 resize-none bg-white dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 bottom-1 text-facebook h-8 p-0 bg-transparent hover:bg-transparent dark:text-gray-300"
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
            <div className="space-y-3 dark:text-gray-400 dark:bg-gray-800">
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

      <SharePostModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShare}
        postID={post.id}
      />
    </>
  );
};

export default PostCard;
