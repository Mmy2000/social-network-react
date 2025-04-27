
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserMinus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

const friendRequests = [
  { id: 5, name: 'David Wilson', mutual: 8, avatar: 'https://source.unsplash.com/photo-1721322800607-8c38375eef04' },
];

const friendSuggestions = [
  { id: 6, name: 'Jessica Brown', mutual: 12, avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7' },
  { id: 7, name: 'Alex Martinez', mutual: 5, avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 8, name: 'Taylor Swift', mutual: 3, avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
];

const allFriends = [
  { id: 2, name: 'Emma Thompson', avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: 3, name: 'Michael Lee', avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 9, name: 'Lisa Chen', avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c' },
  { id: 10, name: 'James Rodriguez', avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7' },
];

const Friends = () => {
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
              {allFriends.map(friend => (
                <Card key={friend.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img src={friend.avatar} alt={friend.name} />
                      </Avatar>
                      <div className="flex-1">
                        <Link to={`/profile/${friend.id}`} className="font-semibold text-lg hover:underline">
                          {friend.name}
                        </Link>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="ghost" className="h-8">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Friends
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8">
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
              {friendRequests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img src={request.avatar} alt={request.name} />
                      </Avatar>
                      <div className="flex-1">
                        <Link to={`/profile/${request.id}`} className="font-semibold text-lg hover:underline">
                          {request.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {request.mutual} mutual friends
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-facebook hover:bg-facebook-dark">
                            Accept
                          </Button>
                          <Button size="sm" variant="outline">
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendSuggestions.map(suggestion => (
                <Card key={suggestion.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center p-4">
                      <Avatar className="h-16 w-16 mr-4">
                        <img src={suggestion.avatar} alt={suggestion.name} />
                      </Avatar>
                      <div className="flex-1">
                        <Link to={`/profile/${suggestion.id}`} className="font-semibold text-lg hover:underline">
                          {suggestion.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {suggestion.mutual} mutual friends
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-facebook hover:bg-facebook-dark">
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
