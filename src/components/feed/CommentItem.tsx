import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import clsx from "clsx";

const CommentItem = ({ comment, level = 0 }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useUser();

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      console.log(`Reply to comment ID ${comment.id}:`, replyText);
      setReplyText("");
      setShowReplyBox(false);
    }
  };

  return (
    <div className="relative pl-4 border-l border-gray-300 ml-3">
      <div className="flex items-start space-x-2 mt-3 relative">
        <div className="w-8 h-8 shrink-0">
          <Avatar className="h-8 w-8">
            <img
              src={comment.created_by.profile.profile_picture}
              alt={comment.created_by.profile.full_name}
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
            to={`/profile/${comment.created_by.id}`}
            className="text-sm font-semibold hover:underline"
          >
            {comment.created_by.profile.full_name}
          </Link>
          <p className="text-sm">{comment.content}</p>

          {/* Like, Reply, Time */}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <button className="hover:underline">Like</button>
            <span>
              {comment.like_count} {comment.like_count === 1 ? "like" : "likes"}
            </span>
            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:underline"
            >
              Reply
            </button>
            <span>{comment.time_since_created}</span>
          </div>

          {/* Reply input box */}
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

      {/* Recursive replies */}
      {comment.replies?.length > 0 && (
        <div className="pl-6 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
