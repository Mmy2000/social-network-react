import React from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface NotificationSender {
  id: number;
  first_name: string;
  last_name: string;
  profile: {
    profile_picture: string;
  };
}

interface Notification {
  id: number;
  notification_message: string;
  post?: {
    id: number;
  };
  comment?: {
    id: number;
    post: {
      id: number;
    };
  };
  is_read: boolean;
  created_at: string;
  sender: NotificationSender;
  notification_type:
    | "like"
    | "comment"
    | "reply"
    | "comment_like"
    | "friend_request"
    | "friend_request_accepted"
    | "friend_request_rejected"
    | "friend_request_cancelled";
}

interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
}

const NotificationList = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<NotificationResponse>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiService.get("/notifications/", user?.access);
      return response.data;
    },
    enabled: !!user?.access,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.post(
        `/notifications/${notificationId}/mark-read/`,
        null,
        user?.access
      );
      // Update the notification in the cache
      queryClient.setQueryData(
        ["notifications"],
        (oldData: NotificationResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            notifications: oldData.notifications.map((notification) =>
              notification.id === notificationId
                ? { ...notification, is_read: true }
                : notification
            ),
            unread_count: Math.max(0, oldData.unread_count - 1),
          };
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.post(
        "/notifications/mark-all-read/",
        null,
        user?.access
      );
      // Update all notifications in the cache
      queryClient.setQueryData(
        ["notifications"],
        (oldData: NotificationResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            notifications: oldData.notifications.map((notification) => ({
              ...notification,
              is_read: true,
            })),
            unread_count: 0,
          };
        }
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "success",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "error",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    navigate(getNotificationLink(notification));
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.notification_type) {
      case "like":
      case "comment":
      case "reply":
      case "comment_like":
        return `/post/${notification.post?.id}`;
      case "friend_request":
      case "friend_request_accepted":
      case "friend_request_rejected":
      case "friend_request_cancelled":
        return "/friends";
      default:
        return "#";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-gray-500">
        <BellOff className="h-12 w-12 mb-2" />
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-2 text-blue-600"
            onClick={markAllAsRead}
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      )}
      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.is_read ? "bg-blue-50" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <img
                    src={
                      notification.sender.profile.profile_picture ||
                      "https://via.placeholder.com/150"
                    }
                    alt={`${notification.sender.first_name} ${notification.sender.last_name}`}
                    className="h-full w-full object-cover rounded-full"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">
                        {notification.sender.first_name}{" "}
                        {notification.sender.last_name}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.notification_message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationList;
