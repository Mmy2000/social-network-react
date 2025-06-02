import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/apiService/apiService";

export const REACTION_TYPES = {
  like: { emoji: "👍", name: "Like" },
  love: { emoji: "❤️", name: "Love" },
  haha: { emoji: "😄", name: "Haha" },
  wow: { emoji: "😮", name: "Wow" },
  sad: { emoji: "😢", name: "Sad" },
  angry: { emoji: "😠", name: "Angry" },
} as const;

export type ReactionType = keyof typeof REACTION_TYPES;

interface ReactionMutationParams {
  targetId: number;
  reactionType: ReactionType;
  targetType: "post" | "comment";
}

export const useReactions = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { toast } = useToast();

  const getToken = () => user?.access || localStorage.getItem("access") || "";

  const reactionMutation = useMutation({
    mutationFn: async ({ targetId, reactionType, targetType }: ReactionMutationParams) => {
      const endpoint = targetType === "post" 
        ? `/posts/${targetId}/react/`
        : `/posts/comment/${targetId}/react/`;
      
      const response = await apiService.post(endpoint, { reaction_type: reactionType }, getToken());
      return response.data;
    },
    onSuccess: (data, { targetType }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (targetType === "post") {
        queryClient.invalidateQueries({ queryKey: ["post", data.id.toString()] });
      }
      
      toast({
        title: "Success",
        description: "Reaction updated successfully",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "error",
      });
    },
  });

  const getUserReaction = (reactions: any[]): { type: ReactionType; emoji: string } | null => {
    if (!user || !Array.isArray(reactions)) return null;
    
    const userReaction = reactions.find(reaction => reaction.created_by.id === user.id);
    if (!userReaction) return null;

    return {
      type: userReaction.reaction_type as ReactionType,
      emoji: REACTION_TYPES[userReaction.reaction_type as ReactionType].emoji,
    };
  };

  return {
    reactionMutation,
    getUserReaction,
    REACTION_TYPES,
  };
}; 