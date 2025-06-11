import React from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import NotificationList from "./NotificationList";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";

const NotificationPopover = () => {
  const { user } = useUser();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await apiService.get("/notifications/", user?.access);
      return response.data;
    },
    enabled: !!user?.access,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = data?.unread_count || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative dark:text-gray-400 dark:hover:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
