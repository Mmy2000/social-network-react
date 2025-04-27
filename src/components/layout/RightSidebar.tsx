
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from 'react-router-dom';

const friendSuggestions = [
  { id: 2, name: 'Emma Thompson', mutual: 3, avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: 3, name: 'Michael Lee', mutual: 5, avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 4, name: 'Sophia Garcia', mutual: 2, avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c' }
];

const birthdays = [
  { id: 5, name: 'David Wilson', avatar: 'https://source.unsplash.com/photo-1721322800607-8c38375eef04' },
];

const RightSidebar = () => {
  return (
    <aside className="hidden lg:block w-80 p-4 space-y-6">
      {/* Birthdays */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Birthdays</h3>
        {birthdays.map(person => (
          <div key={person.id} className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="bg-blue-100 text-facebook rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium">{person.name}'s</span> birthday is today
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">People You May Know</h3>
        <div className="space-y-4">
          {friendSuggestions.map(friend => (
            <div key={friend.id} className="flex">
              <Avatar className="h-10 w-10 mr-3">
                <img src={friend.avatar} alt={friend.name} />
              </Avatar>
              <div className="flex-1">
                <Link to={`/profile/${friend.id}`} className="font-medium text-sm hover:underline">
                  {friend.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {friend.mutual} mutual friends
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button size="sm" variant="default" className="text-xs h-7 bg-facebook hover:bg-facebook-dark">
                    Add Friend
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
              </svg>
            </Button>
          </div>
        </div>
        
        <ul className="space-y-1">
          {friendSuggestions.map(friend => (
            <li key={friend.id}>
              <Link 
                to={`/messages/${friend.id}`} 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 mr-3">
                    <img src={friend.avatar} alt={friend.name} />
                  </Avatar>
                  <span className="absolute bottom-0 right-2 bg-green-500 h-2 w-2 rounded-full border border-white"></span>
                </div>
                <span>{friend.name}</span>
              </Link>
            </li>
          ))}
          {birthdays.map(person => (
            <li key={person.id}>
              <Link 
                to={`/messages/${person.id}`} 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8 mr-3">
                    <img src={person.avatar} alt={person.name} />
                  </Avatar>
                  <span className="absolute bottom-0 right-2 bg-green-500 h-2 w-2 rounded-full border border-white"></span>
                </div>
                <span>{person.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Footer */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-1">
          <Link to="#" className="hover:underline">Privacy</Link>
          <span>·</span>
          <Link to="#" className="hover:underline">Terms</Link>
          <span>·</span>
          <Link to="#" className="hover:underline">Advertising</Link>
          <span>·</span>
          <Link to="#" className="hover:underline">Cookies</Link>
          <span>·</span>
          <Link to="#" className="hover:underline">More</Link>
        </div>
        <p>© 2025 SocialBook</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
