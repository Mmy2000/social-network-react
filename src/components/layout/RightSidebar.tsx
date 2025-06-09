import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, UserPlus, UserCheck, UserX } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import { ScrollArea } from "@/components/ui/scroll-area";

const birthdays = [
  {
    id: 5,
    name: "David Wilson",
    avatar: "https://source.unsplash.com/photo-1488590528505-98d2b5aba04b",
  },
];

const RightSidebar = () => {
  const {
    friends,
    suggestions,
    requests,
    isLoadingFriends,
    isLoadingSuggestions,
    isLoadingRequests,
    sendFriendRequest,
    updateFriendRequest,
    removeFriend,
    isLoading,
  } = useFriends();

  const { startConversation } = useChat();
  const [startingChatWith, setStartingChatWith] = useState<number | null>(null);

  const handleStartChat = async (friendId: number) => {
    setStartingChatWith(friendId);
    try {
      await startConversation(friendId);
    } finally {
      setStartingChatWith(null);
    }
  };

  if (isLoadingFriends || isLoadingSuggestions || isLoadingRequests) {
    return (
      <div className="flex items-center justify-center mt-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <aside className="hidden lg:block w-80 p-4 space-y-6">
      {/* Friend Requests */}
      {requests && requests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-3">Friend Requests</h3>
          <ScrollArea className="h-32">
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <img
                      src={request.created_by?.profile?.profile_picture}
                      alt={request.created_by?.profile?.full_name}
                    />
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      to={`/profile/${request.created_by?.id}`}
                      className="font-medium text-sm hover:underline"
                    >
                      {request.created_by?.profile?.full_name}
                    </Link>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() =>
                          updateFriendRequest({
                            requestId: request.id,
                            status: "accepted",
                          })
                        }
                        size="sm"
                        variant="default"
                        className="text-xs h-7 bg-facebook hover:bg-facebook-dark"
                        disabled={isLoading(request.id)}
                      >
                        {isLoading(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 mr-1" />
                        )}
                        {isLoading(request.id) ? "Accepting..." : "Accept"}
                      </Button>
                      <Button
                        onClick={() =>
                          updateFriendRequest({
                            requestId: request.id,
                            status: "rejected",
                          })
                        }
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        disabled={isLoading(request.id)}
                      >
                        {isLoading(request.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 mr-1" />
                        )}
                        {isLoading(request.id) ? "Declining..." : "Decline"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Friend Suggestions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">People You May Know</h3>
        {suggestions.length > 0 ? ( 
        <ScrollArea className="h-[calc(100%-12rem)]">
          <div className="space-y-4">
            {suggestions.map((friend) => (
              <div key={friend.id} className="flex">
                <Avatar className="h-10 w-10 mr-3">
                  <img
                    src={friend.profile?.profile_picture}
                    alt={friend?.profile?.full_name}
                  />
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/profile/${friend.id}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {friend?.profile?.full_name}
                  </Link>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="cursor-pointer text-sm text-gray-500">
                          {friend?.mutual_friends_count} mutual friends
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-col">
                          {Array.isArray(friend?.mutual_friends) &&
                            friend?.mutual_friends.map((user) => (
                              <Link
                                key={user?.id}
                                to={`/profile/${user?.id}`}
                                className="flex items-center space-x-2 mb-1 hover:underline"
                              >
                                <Avatar className="h-6 w-6">
                                  <img
                                    src={user?.profile_picture}
                                    alt={user?.full_name}
                                  />
                                </Avatar>
                                <span className="text-sm text-gray-700">
                                  {user?.full_name}
                                </span>
                              </Link>
                            ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => sendFriendRequest(friend?.id)}
                      size="sm"
                      variant="default"
                      className="text-xs h-7 bg-facebook hover:bg-facebook-dark"
                      disabled={isLoading(friend?.id)}
                    >
                      {isLoading(friend?.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-1" />
                      )}
                      {isLoading(friend?.id) ? "Sending..." : "Add Friend"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>):(
          <p className="text-gray-500">No suggestions found</p>
        )}
      </div>

      {/* Contacts */}
      <div className="flex flex-col gap-4 sticky top-20 ">
        <div className="bg-white rounded-lg shadow p-4 ">
          <ScrollArea className="h-[calc(100%-12rem)]">
            <h3 className="text-lg font-semibold mb-3">Contacts</h3>
            {friends.length > 0 ? (
            <ul className="space-y-1">
              {friends.map((friend) => (
                <li key={friend.id}>
                  <button
                    onClick={() => handleStartChat(friend.id)}
                    disabled={startingChatWith === friend.id}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover disabled:opacity-50"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 mr-3">
                        <img
                          src={friend?.profile?.profile_picture}
                          alt={friend?.profile?.full_name}
                        />
                      </Avatar>
                      {friend?.is_online && (
                        <span className="absolute bottom-0 right-2 bg-green-500 h-2 w-2 rounded-full border border-white"></span>
                      )}
                    </div>
                    <span className="flex-1 text-left">
                      {friend?.profile?.full_name}
                    </span>
                    {startingChatWith === friend.id && (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    )}
                  </button>
                </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No contacts found</p>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 space-y-1 ">
          <div className="flex flex-wrap gap-1">
            <Link to="#" className="hover:underline">
              Privacy
            </Link>
            <span>·</span>
            <Link to="#" className="hover:underline">
              Terms
            </Link>
            <span>·</span>
            <Link to="#" className="hover:underline">
              Advertising
            </Link>
            <span>·</span>
            <Link to="#" className="hover:underline">
              Cookies
            </Link>
            <span>·</span>
            <Link to="#" className="hover:underline">
              More
            </Link>
          </div>
          <p>© 2025 SocialBook</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
