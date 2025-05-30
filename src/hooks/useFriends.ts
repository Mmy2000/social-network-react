import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

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

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiService.post(
        `/accounts/friend-request/send/`,
        { created_for: userId },
        getToken()
      );
      return response.data;
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
      const response = await apiService.put(
        `/accounts/friend-request/${requestId}/update/`,
        { status },
        getToken()
      );
      return response.data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      toast({
        title: `Request ${status} successfully`,
        variant: "success",
      });
    },
    onError: () => {
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
      await apiService.delete(`/accounts/friends/remove/${friendId}/`, getToken());
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

  return {
    friends,
    suggestions,
    requests,
    isLoadingFriends,
    isLoadingSuggestions,
    isLoadingRequests,
    sendFriendRequest: sendFriendRequestMutation.mutate,
    updateFriendRequest: updateFriendRequestMutation.mutate,
    removeFriend: removeFriendMutation.mutate,
    isSendingRequest: sendFriendRequestMutation.isPending,
    isUpdatingRequest: updateFriendRequestMutation.isPending,
    isRemovingFriend: removeFriendMutation.isPending,
  };
}; 