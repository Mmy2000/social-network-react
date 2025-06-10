import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

interface Profile {
  profile_picture: string;
  full_name: string;
}

interface Friend {
  id: number;
  profile: Profile;
  is_online: boolean;
  mutual_friends?: any[];
  mutual_friends_count?: number;
}

interface FriendSuggestion {
  id: number;
  profile: Profile;
  mutual_friends: any[];
  mutual_friends_count: number;
}

export const useFriends = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: { accept: boolean; decline: boolean } }>({});

  // Helper function to get token
  const getToken = () => user?.access || localStorage.getItem("access") || "";

  // Fetch friends list
  const { data: friends = [], isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const response = await apiService.get("/accounts/friends/", getToken());
      return response.data;
    },
    enabled: !!user?.access,
  });

  // Fetch friend suggestions
  const { data: suggestions = [], isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["friendSuggestions"],
    queryFn: async () => {
      const response = await apiService.get("/accounts/friends_suggestions/", getToken());
      return response.data?.suggestions || [];
    },
    enabled: !!user?.access,
  });

  // Fetch friend requests
  const { data: requests = [], isLoading: isLoadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const response = await apiService.get("/accounts/friends_requests/", getToken());
      return response.data;
    },
    enabled: !!user?.access,
  });

  // Fetch group invitations
  const { data: groupInvitations = [], isLoading: isLoadingGroupInvitations } = useQuery({
    queryKey: ["groupInvitations"],
    queryFn: async () => {
      const response = await apiService.get("/groups/invitations/", getToken());
      return response.data;
    },
    enabled: !!user?.access,
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      setLoadingStates((prev) => ({ ...prev, [userId]: { accept: true, decline: false } }));
      try {
        const response = await apiService.post(
          `/accounts/friend-request/send/`,
          { created_for: userId },
          getToken()
        );
        return response.data;
      } finally {
        setLoadingStates((prev) => ({ ...prev, [userId]: { accept: false, decline: false } }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendSuggestions"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({
        title: "Friend request sent!",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to send friend request",
        variant: "error",
      });
    },
  });

  // Update friend request mutation (accept/reject)
  const updateFriendRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: "accepted" | "rejected" }) => {
      setLoadingStates((prev) => ({ ...prev, [requestId]: { accept: status === "accepted" ? true : false, decline: status === "rejected" ? true : false } }));
      try {
        const token = getToken();
        const response = await apiService.put(
          `/accounts/friend-request/${requestId}/update/`,
          { status },
          token
        );
        return response.data;
      } finally {
        setLoadingStates((prev) => ({ ...prev, [requestId]: { accept: false, decline: false } }));
      }
    },
    onSuccess: (data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({
        title: `Request ${status} successfully`,
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("Friend request update error:", error);
      toast({
        title: "Error",
        description: "Failed to update friend request",
        variant: "error",
      });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      setLoadingStates((prev) => ({ ...prev, [friendId]: { accept: false, decline: true } }));
      try {
        await apiService.delete(`/accounts/friends/remove/${friendId}/`, getToken());
      } finally {
        setLoadingStates((prev) => ({ ...prev, [friendId]: { accept: false, decline: false } }));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      
      toast({
        title: "Friend removed successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove friend.",
        variant: "error",
      });
    },
  });

  // Handle group invitation response
  const handleGroupInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, action }: { invitationId: number; action: "accept" | "decline" }) => {
      setLoadingStates((prev) => ({ ...prev, [invitationId]: { accept: action === "accept" ? true : false, decline: action === "decline" ? true : false } }));
      try {
        const response = await apiService.post(
          `/groups/invitations/${invitationId}/respond/`,
          { action },
          getToken()
        );
        return response.data;
      } finally {
        setLoadingStates((prev) => ({ ...prev, [invitationId]: { accept: false, decline: false } }));
      }
    },
    onSuccess: (data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["groupInvitations"] });
      toast({
        title: `Invitation ${action}ed successfully`,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to process invitation",
        variant: "error",
      });
    },
  });

  return {
    friends,
    suggestions,
    requests,
    groupInvitations,
    isLoadingFriends,
    isLoadingSuggestions,
    isLoadingRequests,
    isLoadingGroupInvitations,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    updateFriendRequest: updateFriendRequestMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    handleGroupInvitation: handleGroupInvitationMutation.mutate,
    isLoading: (userId: number, action?: "accept" | "decline") => {
      const state = loadingStates[userId];
      if (!state) return false;
      return action ? state[action] : state.accept || state.decline;
    },
  };
}; 