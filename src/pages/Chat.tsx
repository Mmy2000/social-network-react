import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const { user } = useUser();
  const {
    conversations,
    isLoadingConversations,
    unreadMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChat();

  if (isLoadingConversations) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 bg-slate-300 w-1/2" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
      </div>
    );
  }

  if (!user?.access) {
    return (
      <div className="text-center text-red-500 mt-4">
        Please login to view conversations.
      </div>
    );
  }
  console.log(unreadMessages);

  return (
    <div className="max-w-xl mx-auto p-6 dark:text-gray-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-300">
        Conversations
      </h2>

      <InfiniteScroll
        dataLength={conversations.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center py-4">
            <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
          </div>
        }
        endMessage={
          <p className="text-center text-sm text-gray-500 py-4 dark:text-gray-400">
            No more conversations to load.
          </p>
        }
      >
        <div className="space-y-4 relative">
          {conversations.map((conv, index) => {
            const otherUser = conv.users.find((u) => u.id !== user?.id);
            const imageUrl =
              otherUser?.profile?.profile_picture || "/default-avatar.png";

            const match = unreadMessages?.find((u) => u.id === conv.id);
            const unreadCount = match?.unreadCount || 0;

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/chat/${conv?.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer relative dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={imageUrl} alt={otherUser?.username} />
                        <AvatarFallback>
                          {otherUser?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-300">
                          {otherUser?.profile?.full_name || otherUser?.username}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                          Last updated:{" "}
                          {new Date(conv.modified_at).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500 mt-1 font-bold dark:text-gray-400">
                            {match?.messages?.length > 0
                              ? match.messages[match.messages.length - 1]
                                  ?.created_by?.id ===
                                user?.id
                                ? "You"
                                : match.messages[match.messages.length - 1]
                                    ?.created_by?.profile?.full_name
                              : ""}
                          </p>

                          <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                            {match?.messages?.length > 0
                              ? match.messages[match.messages.length - 1]?.body
                              : ""}
                          </p>
                        </div>
                      </div>

                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Chat;
