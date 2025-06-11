import React, { useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export const REACTIONS = [
  { emoji: "👍", type: "like", name: "Like" },
  { emoji: "❤️", type: "love", name: "Love" },
  { emoji: "😂", type: "haha", name: "Haha" },
  { emoji: "😮", type: "wow", name: "Wow" },
  { emoji: "😢", type: "sad", name: "Sad" },
  { emoji: "😡", type: "angry", name: "Angry" },
];

interface Like {
  id: number;
  username: string;
  image: string;
  reaction_type: string;
  reaction_display: string;
}

interface ReactionsProps {
  likes: Like[];
  likeCount: number;
  onReact: (reactionType: string) => void;
  selectedReaction?: string;
  type: "post" | "comment";
}

const Reactions: React.FC<ReactionsProps> = ({
  likes,
  likeCount,
  onReact,
  selectedReaction,
  type,
}) => {
  const [loadingReaction, setLoadingReaction] = useState<string | null>(null);

  const handleReactionClick = async (reactionType: string) => {
    setLoadingReaction(reactionType);
    try {
      await onReact(reactionType);
    } finally {
      setLoadingReaction(null);
    }
  };

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button
          variant={type === "post" ? "ghost" : "link"}
          className={`${
            type === "post"
              ? "flex-1 group relative rounded-none dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              : "hover:underline dark:text-gray-400 dark:border-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {selectedReaction}
          <span
            className={cn(
              "transition-colors",
              selectedReaction &&
                likes.find((like) => like.reaction_display === selectedReaction)
                  ?.reaction_type === "love"
                ? "text-red-500"
                : selectedReaction &&
                  likes.find(
                    (like) => like.reaction_display === selectedReaction
                  )?.reaction_type === "like"
                ? "text-yellow-500"
                : selectedReaction &&
                  likes.find(
                    (like) => like.reaction_display === selectedReaction
                  )?.reaction_type === "haha"
                ? "text-yellow-500"
                : selectedReaction &&
                  likes.find(
                    (like) => like.reaction_display === selectedReaction
                  )?.reaction_type === "wow"
                ? "text-yellow-500"
                : selectedReaction &&
                  likes.find(
                    (like) => like.reaction_display === selectedReaction
                  )?.reaction_type === "sad"
                ? "text-yellow-500"
                : selectedReaction &&
                  likes.find(
                    (like) => like.reaction_display === selectedReaction
                  )?.reaction_type === "angry"
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {selectedReaction
              ? likes.find((like) => like.reaction_display === selectedReaction)
                  ?.reaction_type
              : "Like"}
          </span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent
        side="top"
        align="start"
        className="w-fit p-2 mb-2 shadow-lg dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700  dark:hover:text-gray-300"
      >
        <div className="flex flex-col gap-2">
          {/* Reaction Options */}
          <div className="flex gap-1 p-1 bg-white rounded-full shadow-md dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:text-gray-300">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReactionClick(reaction.type)}
                className="relative group  "
                disabled={loadingReaction !== null}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {reaction.name}
                </div>
                <div
                  className={cn(
                    "text-2xl p-2 rounded-full transition-all duration-200 hover:scale-150 hover:-translate-y-2  ",
                    selectedReaction === reaction.emoji &&
                      "scale-125 bg-gray-100 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  {loadingReaction === reaction.type ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    reaction.emoji
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Likes List */}
          {likes.length > 0 && (
            <div className="border-t pt-2 mt-1 max-h-[200px] overflow-y-auto dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:text-gray-300">
              <div className="flex flex-col gap-1">
                {likes.map((like) => (
                  <Link
                    key={like.id}
                    to={`/profile/${like.id}`}
                    className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <Avatar className="h-6 w-6">
                      <img src={like.image} alt={like.username} />
                    </Avatar>
                    <span className="text-sm font-medium">{like.username}</span>
                    <span className="text-sm ml-auto opacity-70">
                      {like.reaction_display}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default Reactions;
