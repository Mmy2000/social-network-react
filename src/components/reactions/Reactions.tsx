import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

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
}

const Reactions: React.FC<ReactionsProps> = ({
  likes,
  likeCount,
  onReact,
  selectedReaction,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1 cursor-pointer">
          {selectedReaction ? (
            <span className="text-lg">{selectedReaction}</span>
          ) : (
            <span className="text-gray-500 text-sm">Like</span>
          )}
          {likeCount > 0 && (
            <span className="text-sm text-gray-500">{likeCount}</span>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit p-2">
        <div className="flex flex-col gap-2">
          {/* Reaction Options */}
          <div className="flex gap-1 p-1 bg-white rounded-full shadow-sm">
            {REACTIONS.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => onReact(reaction.type)}
                className={`text-2xl hover:scale-125 transition-transform p-1.5 rounded-full hover:bg-gray-100 ${
                  selectedReaction === reaction.emoji
                    ? "bg-gray-100 scale-110"
                    : ""
                }`}
                title={reaction.name}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>

          {/* Likes List */}
          {likes.length > 0 && (
            <div className="border-t pt-2 mt-1">
              <div className="flex flex-col gap-1">
                {likes.map((like) => (
                  <Link
                    key={like.id}
                    to={`/profile/${like.id}`}
                    className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded"
                  >
                    <Avatar className="h-6 w-6">
                      <img src={like.image} alt={like.username} />
                    </Avatar>
                    <span className="text-sm">{like.username}</span>
                    <span className="text-sm ml-auto">
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
