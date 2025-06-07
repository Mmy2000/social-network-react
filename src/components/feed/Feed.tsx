
import React from "react";
import CreatePostCard from "./CreatePostCard";
import PostCard from "./PostCard";
import apiService from "@/apiService/apiService";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

const fetchPosts = async (
  token?: string,
  groupId?: string,
  pageParam = 1,
  pageSize = 10
) => {
  try {
    const query = groupId
      ? `?group_id=${groupId}&page=${pageParam}&per_page=${pageSize}`
      : `?page=${pageParam}&per_page=${pageSize}`;

    const response = token
      ? await apiService.get(`/posts/${query}`, token)
      : await apiService.getWithoutToken(`/posts/${query}`);

    if (response.status_code === 200) {
      return {
        posts: response.data,
        nextPage: pageParam + 1,
        isLastPage:
          response.pagination?.current_page >= response.pagination?.last_page,
      };
    }

    throw new Error("Failed to fetch posts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

const Feed: React.FC<{ groupId?: string }> = ({ groupId }) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["posts", groupId, user?.access],
    queryFn: ({ pageParam = 1 }) =>
      fetchPosts(user?.access, groupId, pageParam),
    getNextPageParam: (lastPage) =>
      !lastPage.isLastPage ? lastPage.nextPage : undefined,
    enabled: !!user,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const updatePostById = (postId: string, updatedData: any) => {
    queryClient.setQueryData(
      ["posts", groupId, user?.access],
      (oldData: any) => {
        if (!oldData) return;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.id === postId
                ? { ...post, ...updatedData, group: groupId }
                : post
            ),
          })),
        };
      }
    );

    queryClient.setQueryData(["post", postId], (oldPost: any) => {
      if (!updatedData) return null;
      return { ...oldPost, ...updatedData };
    });
  };

  const handleNewPost = () => {
    queryClient.invalidateQueries({
      queryKey: ["posts", groupId, user?.access],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-5">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5 text-red-500">Failed to load posts.</div>
    );
  }

  const allPosts = data?.pages?.flatMap((page: any) => page.posts) || [];

  return (
    <div className="max-w-xl mx-auto py-4">
      <CreatePostCard groupId={id} onPostCreated={handleNewPost} />
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
        endMessage={
          <p className="text-center text-sm text-gray-500 py-4">
            No more posts to load.
          </p>
        }
      >
        <div className="space-y-4">
          {allPosts.map((post: any) => (
            <PostCard
              key={post.id}
              groupId={groupId}
              post={post}
              updatePost={updatePostById}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default Feed;
