import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { UserCheck, UserPlus, UserMinus, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFriends } from "@/hooks/useFriends";

const Friends = () => {
  const {
    friends,
    requests,
    suggestions,
    isLoadingFriends,
    isLoadingSuggestions,
    isLoadingRequests,
    sendFriendRequest,
    updateFriendRequest,
    removeFriend,
    isLoading,    
    
  } = useFriends();

  if (isLoadingFriends || isLoadingSuggestions || isLoadingRequests) {
    return (
      <div className="flex items-center justify-center mt-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-screen-xl py-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Friends</h1>
          <div className="w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search friends"
                className="pl-10 bg-gray-100 border-gray-200 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6 bg-gray-100">
            <TabsTrigger value="all">All Friends</TabsTrigger>
            <TabsTrigger value="requests">Friend Requests</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends?.length === 0 ? (
                <p>No friends found</p>
              ) : (
                friends?.map((friend) => (
                  <Card key={friend.id} className="overflow-hidden">
                    <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img
                          src={friend?.profile?.profile_picture}
                          alt={friend?.profile?.full_name}
                        />
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          to={`/profile/${friend.id}`}
                          className="font-semibold text-lg hover:underline"
                        >
                          {friend?.profile?.full_name}
                        </Link>
                        <div className="flex flex-col gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="h-8">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Friends
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => removeFriend(friend?.id)}
                            disabled={isLoading(friend?.profile?.id)}
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <Avatar className="h-16 w-16 mr-4">
                          <img
                            src={request?.created_by?.profile?.profile_picture}
                            alt={request?.created_by?.profile?.full_name}
                          />
                        </Avatar>
                        <div className="flex-1">
                          <Link
                            to={`/profile/${request?.created_by?.id}`}
                            className="font-semibold text-lg hover:underline"
                          >
                            {request?.created_by?.profile?.full_name}
                          </Link>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="cursor-pointer text-sm text-gray-500">
                                  {request?.mutual_friends_count} mutual friends
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="flex flex-col">
                                  {Array.isArray(request?.mutual_friends) &&
                                    request?.mutual_friends.map((friend) => (
                                      <Link
                                        key={friend?.id}
                                        to={`/profile/${friend?.id}`}
                                        className="flex items-center space-x-2 mb-1 hover:underline"
                                      >
                                        <Avatar className="h-6 w-6">
                                          <img
                                            src={
                                              friend?.profile?.profile_picture
                                            }
                                            alt={friend?.profile?.full_name}
                                          />
                                        </Avatar>
                                        <span className="text-sm text-gray-700">
                                          {friend?.profile?.full_name}
                                        </span>
                                      </Link>
                                    ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="bg-facebook hover:bg-facebook-dark"
                              onClick={() =>
                                updateFriendRequest({
                                  requestId: request.id,
                                  status: "accepted",
                                })
                              }
                              disabled={isLoading(request?.created_by?.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateFriendRequest({
                                  requestId: request.id,
                                  status: "rejected",
                                })
                              }
                              disabled={isLoading(request?.created_by?.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p>No requests found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions?.length === 0 ? (
                <p>No suggestions found</p>
              ) : (
                suggestions?.map((suggestion) => (
                  <Card key={suggestion?.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img
                          src={suggestion?.profile?.profile_picture}
                          alt={suggestion?.profile?.full_name}
                        />
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          to={`/profile/${suggestion?.id}`}
                          className="font-semibold text-lg hover:underline"
                        >
                          {suggestion?.profile?.full_name}
                        </Link>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="cursor-pointer text-sm text-gray-500">
                                {suggestion?.mutual_friends_count} mutual
                                friends
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="flex flex-col">
                                {Array.isArray(suggestion?.mutual_friends) &&
                                  suggestion?.mutual_friends.map((friend) => (
                                    <Link
                                      key={friend?.id}
                                      to={`/profile/${friend?.id}`}
                                      className="flex items-center space-x-2 mb-1 hover:underline"
                                    >
                                      <Avatar className="h-6 w-6">
                                        <img
                                          src={friend?.profile_picture}
                                          alt={friend?.full_name}
                                        />
                                      </Avatar>
                                      <span className="text-sm text-gray-700">
                                        {friend?.full_name}
                                      </span>
                                    </Link>
                                  ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-facebook hover:bg-facebook-dark"
                            onClick={() => sendFriendRequest(suggestion?.id)}
                            disabled={isLoading(suggestion?.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {isLoading(suggestion?.id) ? "Sending..." : "Add Friend"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
