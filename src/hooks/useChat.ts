import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { useNavigate } from "react-router-dom";
import { toast, useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import useWebSocket from "react-use-websocket";
import React from "react";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;
const API_HOST = import.meta.env.VITE_API_WS_HOST as string;

const fetchConversations = async (
  token: string,
  pageParam = 1
): Promise<{
  conversations: any[];
  nextPage: number;
  isLastPage: boolean;
}> => {
  const res = await apiService.get(
    `/chat/conversations/?page=${pageParam}&per_page=${PAGE_SIZE}`,
    token
  );

  return {
    conversations: res.data,
    nextPage: pageParam + 1,
    isLastPage: res.pagination?.current_page >= res.pagination?.last_page,
  };
};

export const useChat = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastMessageRef = React.useRef<string | null>(null);

  // Global WebSocket connection for notifications
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(
    user?.access ? `${API_HOST}/ws/notifications/?token=${user.access}` : null,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  // Function to mark messages as read
  const markMessagesAsRead = React.useCallback((conversationId: string) => {
    if (user?.access) {
      sendJsonMessage({
        event: "mark_read",
        data: {
          conversation_id: conversationId,
        },
      });
    }
  }, [user?.access, sendJsonMessage]);

  // Handle global notifications
  React.useEffect(() => {
    if (lastJsonMessage && typeof lastJsonMessage === "object" && "event" in lastJsonMessage) {
      const { event, message, from_user } = lastJsonMessage as any;

      if (event === "new_message_notification") {
        // Only show notification if it's a different message
        if (message !== lastMessageRef.current) {
          // Update last message
          lastMessageRef.current = message;

          // Show notification
          toast({
            title: "New Message",
            description: `${message}`,
            variant: "default",
          });

          // Play notification sound
          const audio = new Audio("/notification-sound.mp3");
          audio.play().catch(() => {
            // Handle autoplay restrictions
            console.log("Autoplay prevented");
          });
        }
      }

      // Handle messages marked as read
      if (event === "messages_marked_read") {
        // Invalidate and refetch unread messages
        queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
      }
    }
  }, [lastJsonMessage, navigate, toast, queryClient]);

  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["conversations", user?.access],
    queryFn: ({ pageParam = 1 }) => fetchConversations(user?.access, pageParam),
    getNextPageParam: (lastPage) =>
      !lastPage.isLastPage ? lastPage.nextPage : undefined,
    enabled: !!user?.access,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: unreadMessages, isLoading: isLoadingUnreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const response = await apiService.get(
        `/chat/conversations/`,
        user?.access
      );
      
      // Map conversations to include unread count
      const conversationsWithUnreadCount = response.data.map((conversation: any) => ({
        ...conversation,
        unreadCount: conversation.messages.filter(
  (message: any) =>
    !message.is_read && message.created_by.id !== user?.id
).length

      }));
      
      return conversationsWithUnreadCount;
    },
    enabled: !!user?.access,
  });

  const startConversation = async (userId: number) => {
    try {
      const response = await apiService.get(
        `/chat/conversations/start/${userId}/`,
        user?.access
      );
      
      if (response?.data?.conversation_id) {
        navigate(`/chat/${response.data.conversation_id}`);
      } else {
        toast({
          title: "Error",
          description: "Could not start conversation. Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Could not start conversation. Please try again.",
        variant: "error",
      });
    }
  };

  const allConversations = conversationsData?.pages.flatMap((page) => page.conversations) || [];

  return {
    startConversation,
    conversations: allConversations,
    isLoadingConversations,
    unreadMessages,
    isLoadingUnreadMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markMessagesAsRead,
  };
}; 