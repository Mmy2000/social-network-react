
import React, { useEffect, useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from 'react-router-dom';
import apiService from '@/apiService/apiService';
import { useUser } from '@/context/UserContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFriend } from '@/context/FriendContext';
import { profile } from 'console';

const friendSuggestions = [
  { id: 2, name: 'Emma Thompson', mutual: 3, avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: 3, name: 'Michael Lee', mutual: 5, avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 4, name: 'Sophia Garcia', mutual: 2, avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c' }
];

const birthdays = [
  { id: 5, name: 'David Wilson', avatar: 'https://source.unsplash.com/photo-1721322800607-8c38375eef04' },
];

const RightSidebar = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [friendsSuggestions, setFriendsSuggestions] = useState([]);
  const { sendFriendRequest, loadingBtn } = useFriend();  
  const token = user?.access || localStorage.getItem("access");

  const fetchFriendsSuggestions = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`/accounts/friends_suggestions/`, token);
      setFriendsSuggestions(res?.data?.suggestions);
    } catch (error) {
      setLoading(false);
    }
    setLoading(false);
  };

  const fetchFriendsData = async () => {
    setLoading(true);
    try {
      const token = user?.access || null;
      const res = await apiService.get(`/accounts/friends/`, token);
      setFriends(res?.data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    setLoading(false);
  };  

  useEffect(() => {
      if (user?.access && localStorage.getItem("access")) {
        fetchFriendsSuggestions()
        fetchFriendsData()        
      }else{
        fetchFriendsSuggestions()  
        fetchFriendsData()
        
      }
    }, [user]);

  return (
    <aside className="hidden lg:block w-80 p-4 space-y-6">
      {/* Birthdays */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Trends</h3>
        {birthdays.map((person) => (
          <div key={person.id} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="bg-blue-100 text-facebook rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{person.name}'s</span> birthday is
                today
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">People You May Know</h3>
        <div className="space-y-4">
          {friendsSuggestions.map((friend) => (
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
                      <TooltipTrigger asChild>
                        <p className="cursor-pointer text-sm text-gray-500">
                          {friend?.mutual_friends_count} mutual friends
                        </p>
                      </TooltipTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">
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
                <div className="flex space-x-2 mt-2">
                  <Button
                    onClick={() => sendFriendRequest(friend?.id)}
                    size="sm"
                    variant="default"
                    className="text-xs h-7 bg-facebook hover:bg-facebook-dark"
                  >
                    {loadingBtn ? "Sending..." : "Add Friend"}
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-gray-500 font-medium">Contacts</h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </Button>
          </div>
        </div>

        <ul className="space-y-1">
          {friends.map((friend) => (
            <li key={friend.id}>
              <Link
                to={`/messages/${friend?.id}`}
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 mr-3">
                    <img src={friend?.profile?.profile_picture} alt={friend?.profile?.full_name} />
                  </Avatar>
                  <span className="absolute bottom-0 right-2 bg-green-500 h-2 w-2 rounded-full border border-white"></span>
                </div>
                <span>{friend?.profile?.full_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-1">
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
    </aside>
  );
};

export default RightSidebar;
