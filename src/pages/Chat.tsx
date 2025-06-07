import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroll-component";

const PAGE_SIZE = 10;

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

const Chat = () => {
  const { user } = useUser();

  const {
    data,
    isLoading,
    isError,
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

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 bg-slate-300 w-1/2" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-4">
        Failed to load conversations.
      </div>
    );
  }
  if (!user?.access) {
    return <div className="text-center text-red-500 mt-4">Please login to view conversations.</div>;
  }

  const allConversations =
    data?.pages.flatMap((page) => page.conversations) || [];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Conversations</h2>

      <InfiniteScroll
        dataLength={allConversations.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center py-4">
            <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
          </div>
        }
        endMessage={
          <p className="text-center text-sm text-gray-500 py-4">
            No more conversations to load.
          </p>
        }
      >
        <div className="space-y-4">
          {allConversations.map((conv, index) => {
            const otherUser = conv.users.find((u) => u.id !== user?.id);
            const imageUrl =
              otherUser?.profile?.profile_picture || "/default-avatar.png";

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/chat/${conv?.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={imageUrl} alt={otherUser?.username} />
                        <AvatarFallback>
                          {otherUser?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {otherUser?.profile?.full_name || otherUser?.username}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Last updated:{" "}
                          {new Date(conv.modified_at).toLocaleString()}
                        </p>
                      </div>
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
