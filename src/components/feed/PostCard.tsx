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

const PostCard = ({ post, updatePost }) => {
  const location = useLocation();
  const isPostDetailPage = location.pathname.includes(`/post/${post?.id}`);
  const [liked, setLiked] = useState(false);
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

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to like a post.",
        variant: "warning",
      });
      return;
    }

    try {
      await likeMutation.mutateAsync(post.id);

      const updatedLikeCount = liked
        ? post.like_count - 1
        : post.like_count + 1;
      updatePost(post.id, {
        like_count: updatedLikeCount,
        likes: liked
          ? post.likes.filter((u) => u.id !== user.id)
          : [...post.likes, user],
      });

      setLiked(!liked);
    } catch (error) {
      console.error("Failed to like/unlike the post", error);
    }
  };

  const handleComment = async (e) => {
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
      await addCommentMutation.mutateAsync({
        postId: post.id,
        content: commentText,
      });

      setCommentText("");
    } catch (error) {
      console.error("Failed to post comment", error);
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
            {liked && (
              <div className="bg-facebook rounded-full p-1 mr-1">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`mr-4 ${
                      liked ? "text-facebook" : "text-gray-700"
                    }  cursor-pointer`}
                  >
                    <span>
                      {post?.like_count > 0
                        ? `${post?.like_count} likes`
                        : "0 likes"}
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
                            {like?.username}
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
                disabled={!commentText.trim()}
              >
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
