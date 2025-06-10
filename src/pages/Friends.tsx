import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  UserCheck,
  UserPlus,
  UserMinus,
  Search,
  Loader2,
  UserX,
  Clock,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFriends } from "@/hooks/useFriends";
import { Badge } from "@/components/ui/badge";

const Friends = () => {
  const {
    friends,
    requests,
    suggestions,
    groupInvitations,
    isLoadingFriends,
    isLoadingSuggestions,
    isLoadingRequests,
    isLoadingGroupInvitations,
    sendFriendRequest,
    updateFriendRequest,
    removeFriend,
    handleGroupInvitation,
    isLoading,
  } = useFriends();  

  if (
    isLoadingFriends ||
    isLoadingSuggestions ||
    isLoadingRequests ||
    isLoadingGroupInvitations
  ) {
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
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Friends</h1>
            {(requests?.length > 0 || groupInvitations?.length > 0) && (
              <Badge variant="destructive" className="rounded-full">
                {requests?.length + groupInvitations?.length} new{" "}
                {requests?.length + groupInvitations?.length === 1
                  ? "notification"
                  : "notifications"}
              </Badge>
            )}
          </div>
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
            <TabsTrigger value="requests" className="relative">
              Friend Requests
              {requests?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="group-invites" className="relative">
              Group Invites
              {groupInvitations?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {groupInvitations.length}
                </span>
              )}
            </TabsTrigger>
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
                              disabled={isLoading(friend?.id)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              {isLoading(friend?.id) ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                "Remove"
                              )}
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
            {requests && requests.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Pending Friend Requests
                  </h2>
                  <p className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline-block mr-1" />
                    Requests expire after 30 days
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {requests.map((request) => (
                    <Card
                      key={request.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <img
                              src={
                                request?.created_by?.profile?.profile_picture
                              }
                              alt={request?.created_by?.profile?.full_name}
                            />
                          </Avatar>
                          <div className="flex-1">
                            <Link
                              to={`/profile/${request?.created_by?.id}`}
                              className="font-semibold text-lg hover:underline block"
                            >
                              {request?.created_by?.profile?.full_name}
                            </Link>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="cursor-pointer text-sm text-gray-500 mb-3">
                                    {request?.mutual_friends_count} mutual
                                    friends
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-2 p-2">
                                    {Array.isArray(request?.mutual_friends) &&
                                      request?.mutual_friends.map((friend) => (
                                        <Link
                                          key={friend?.id}
                                          to={`/profile/${friend?.id}`}
                                          className="flex items-center gap-2 hover:underline"
                                        >
                                          <Avatar className="h-6 w-6">
                                            <img
                                              src={
                                                friend?.profile?.profile_picture
                                              }
                                              alt={friend?.profile?.full_name}
                                            />
                                          </Avatar>
                                          <span className="text-sm">
                                            {friend?.profile?.full_name}
                                          </span>
                                        </Link>
                                      ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="bg-facebook hover:bg-facebook-dark w-full"
                                onClick={() =>
                                  updateFriendRequest({
                                    requestId: request.id,
                                    status: "accepted",
                                  })
                                }
                                disabled={isLoading(request.id, "accept")}
                              >
                                {isLoading(request.id, "accept") ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4 mr-2" />
                                )}
                                {isLoading(request.id, "accept")
                                  ? "Accepting..."
                                  : "Confirm Request"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  updateFriendRequest({
                                    requestId: request.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={isLoading(request.id, "decline")}
                              >
                                {isLoading(request.id, "decline") ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4 mr-2" />
                                )}
                                {isLoading(request.id, "decline")
                                  ? "Declining..."
                                  : "Delete Request"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Friend Requests
                </h3>
                <p className="text-gray-500">
                  You don't have any pending friend requests at the moment.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="group-invites">
            {groupInvitations && groupInvitations.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Group Invitations</h2>
                  <p className="text-sm text-gray-500">
                    <Clock className="h-4 w-4 inline-block mr-1" />
                    Invitations expire after 30 days
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupInvitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <img
                              src={
                                invitation.group.cover_image ||
                                "/default-group-cover.jpg"
                              }
                              alt={invitation.group.name}
                            />
                          </Avatar>
                          <div className="flex-1">
                            <Link
                              to={`/groups/${invitation.group.id}`}
                              className="font-semibold text-lg hover:underline block"
                            >
                              {invitation.group.name}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <Users className="h-4 w-4" />
                              {invitation.group.members_count} members
                            </div>
                            <p className="text-sm text-gray-500 mb-3">
                              Invited by{" "}
                              <Link
                                to={`/profile/${invitation.invited_by.id}`}
                                className="font-medium hover:underline"
                              >
                                {invitation.invited_by.profile.full_name}
                              </Link>
                            </p>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="bg-facebook hover:bg-facebook-dark w-full"
                                onClick={() =>
                                  handleGroupInvitation({
                                    invitationId: invitation.id,
                                    action: "accept",
                                  })
                                }
                                disabled={isLoading(invitation.id, "accept")}
                              >
                                {isLoading(invitation.id, "accept") ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4 mr-2" />
                                )}
                                {isLoading(invitation.id, "accept")
                                  ? "Accepting..."
                                  : "Accept Invitation"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                  handleGroupInvitation({
                                    invitationId: invitation.id,
                                    action: "decline",
                                  })
                                }
                                disabled={isLoading(invitation.id, "decline")}
                              >
                                {isLoading(invitation.id, "decline") ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4 mr-2" />
                                )}
                                {isLoading(invitation.id, "decline")
                                  ? "Declining..."
                                  : "Decline Invitation"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">
                  No Group Invitations
                </h3>
                <p className="text-gray-500">
                  You don't have any pending group invitations at the moment.
                </p>
              </div>
            )}
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
                              {isLoading(suggestion?.id)
                                ? "Sending..."
                                : "Add Friend"}
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
