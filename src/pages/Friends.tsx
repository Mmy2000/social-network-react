
import React, { useEffect, useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserMinus, Search, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useUser } from '@/context/UserContext';
import apiService from '@/apiService/apiService';
import { useToast } from '@/hooks/use-toast';

const friendRequests = [
  { id: 5, name: 'David Wilson', mutual: 8, avatar: 'https://source.unsplash.com/photo-1721322800607-8c38375eef04' },
];

const friendSuggestions = [
  { id: 6, name: 'Jessica Brown', mutual: 12, avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7' },
  { id: 7, name: 'Alex Martinez', mutual: 5, avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 8, name: 'Taylor Swift', mutual: 3, avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
];


const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchFriendsData = async () => {
    setLoading(true)
    try {
      const token = user?.access || null;
      const res = await apiService.get(
        `/accounts/friends/`,
        token
      );
      setFriends(res?.data)

    } catch(error) {
      console.log(error);
      setLoading(false)
    }
    setLoading(false)
  }  

  const fetchRequestsData = async () => {
    setLoading(true)
    try {
      const token = user?.access || null;
      const res = await apiService.get(`/accounts/friends_requests/`, token);
      setRequests(res?.data);
      
    } catch (error) {
      setLoading(false);
    }
    setLoading(false);
  }

  const handleUpdateRequest = async (
    requestId: number,
    status: "accepted" | "rejected"
  ) => {
    setLoading(true);
    try {
      const token = user?.access || null;
      const res = await apiService.put(
        `/accounts/friend-request/${requestId}/update/`,
        { status }, // Backend expects something like { "status": "accepted" }
        token
      );
      console.log(res);
      
      toast({
        title: `Request ${res?.status} successfully`,
        variant: "success",
      });
      fetchRequestsData();
      fetchFriendsData();
    } catch (error) {
      console.log("Update request error:", error);

    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: number) => {
    setLoading(true);
    try {
      const token = user?.access || null;
      await apiService.delete(`/accounts/friends/remove/${friendId}/`, token);

      toast({
        title: "Friend removed successfully.",
        variant: "success",
      });

      fetchFriendsData();
    } catch (error) {
      console.error("Remove friend error:", error);
      toast({
        title: "Failed to remove friend.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (user?.access && localStorage.getItem("access")) {
      fetchFriendsData()    
      fetchRequestsData()  
    }else{
      fetchFriendsData() 
      fetchRequestsData()     
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  console.log(requests);
  

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
              {friends?.map((friend) => (
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
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="ghost" className="h-8">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Friends
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => handleRemoveFriend(friend?.id)}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                            to={`/profile/${request.id}`}
                            className="font-semibold text-lg hover:underline"
                          >
                            {request?.created_by?.profile?.full_name}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {request.mutual} mutual friends
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="bg-facebook hover:bg-facebook-dark"
                              onClick={() =>
                                handleUpdateRequest(request.id, "accepted")
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateRequest(request.id, "rejected")
                              }
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
              {friendSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img src={suggestion.avatar} alt={suggestion.name} />
                      </Avatar>
                      <div className="flex-1">
                        <Link
                          to={`/profile/${suggestion.id}`}
                          className="font-semibold text-lg hover:underline"
                        >
                          {suggestion.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {suggestion.mutual} mutual friends
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-facebook hover:bg-facebook-dark"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Friend
                          </Button>
                          <Button size="sm" variant="outline">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;
