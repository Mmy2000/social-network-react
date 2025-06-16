import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes: any[];
  comments: any[];
  attachments: any[];
  created_by: any;
  [key: string]: any;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  image: string;
  [key: string]: any;
}

interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  image: string;
  [key: string]: any;
}

interface Friend {
  id: number;
  first_name: string;
  last_name: string;
  profile: {
    profile_picture: string;
  };
  date_joined: string;
  [key: string]: any;
}

const Memories = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const queryClient = useQueryClient();
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["memories", "posts"],
    queryFn: async () => {
      const response = await apiService.get(
        "/memories/?params=posts",
        user?.access
      );
      return response.data;
    },
    enabled: activeTab === "posts" && !!user?.access,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["memories", "events"],
    queryFn: async () => {
      const response = await apiService.get(
        "/memories/?params=events",
        user?.access
      );
      return response.data;
    },
    enabled: activeTab === "events" && !!user?.access,
  });

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["memories", "groups"],
    queryFn: async () => {
      const response = await apiService.get(
        "/memories/?params=groups",
        user?.access
      );
      return response.data;
    },
    enabled: activeTab === "groups" && !!user?.access,
  });

  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["memories", "friends"],
    queryFn: async () => {
      const response = await apiService.get(
        "/memories/?params=friends",
        user?.access
      );
      return response.data;
    },
    enabled: activeTab === "friends" && !!user?.access,
  });

  const updatePost = (postId: string, updatedData: Partial<Post>) => {
    // Get the current posts from the cache
    const currentPosts = queryClient.getQueryData<Post[]>(["memories", "posts"]);
    if (currentPosts) {
      // Update the specific post in the cached data
      const updatedPosts = currentPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      );
      queryClient.setQueryData(["memories", "posts"], updatedPosts);
    }
  };

  const isLoading =
    isLoadingPosts || isLoadingEvents || isLoadingGroups || isLoadingFriends;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 dark:text-gray-300">
          On This Day
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      <Tabs defaultValue="posts" onValueChange={setActiveTab}>
        <TabsList className="mb-6 dark:bg-gray-800 text-gray-800 dark:text-gray-300">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="space-y-4">
            {posts?.data?.map((post: Post) => (
              <PostCard key={post.id} post={post} updatePost={updatePost} />
            ))}
            {!posts?.data?.length && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No memories found for this day
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events?.data?.map((event: Event) => (
              <Link to={`/events/${event.id}`} key={event.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={event.image || "/default-event-cover.jpg"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {format(new Date(event.start_time), "MMMM d, yyyy")}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
            {!events?.data?.length && (
              <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                No event memories found for this day
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups?.data?.map((group: Group) => (
              <Link to={`/groups/${group.id}`} key={group.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={group.image || "/default-group-cover.jpg"}
                    alt={group.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {group.description}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Created on{" "}
                      {format(new Date(group.created_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
            {!groups?.data?.length && (
              <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                No group memories found for this day
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="friends">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends?.data?.map((friend: Friend) => (
              <Link to={`/profile/${friend.id}`} key={friend.id}>
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <img
                        src={
                          friend.profile.profile_picture ||
                          "/default-avatar.png"
                        }
                        alt={`${friend.first_name} ${friend.last_name}`}
                      />
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {friend.first_name} {friend.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Friends since{" "}
                        {format(new Date(friend.date_joined), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {!friends?.data?.length && (
              <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">
                No friend memories found for this day
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Memories;
