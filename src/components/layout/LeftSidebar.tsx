
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  Bookmark, 
  Calendar, 
  Video, 
  Image, 
  Heart
} from 'lucide-react';

const menuItems = [
  { icon: Users, label: 'Friends', path: '/friends' },
  { icon: Clock, label: 'Memories', path: '/memories' },
  { icon: Bookmark, label: 'Saved', path: '/saved' },
  { icon: Calendar, label: 'Events', path: '/events' },
  { icon: Video, label: 'Videos', path: '/videos' },
  { icon: Image, label: 'Photos', path: '/photos' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
];

const groupItems = [
  { id: 1, name: 'Tech Enthusiasts', image: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 2, name: 'Hiking Adventures', image: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c' },
  { id: 3, name: 'Book Club', image: 'https://source.unsplash.com/photo-1721322800607-8c38375eef04' },
];

const LeftSidebar = () => {
  return (
    <aside className="hidden md:block w-[280px] p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
      {/* User Profile Link */}
      <Link to="/profile/1" className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover">
        <Avatar className="h-9 w-9 mr-3">
          <img src="https://source.unsplash.com/photo-1649972904349-6e44c42644a7" alt="User" />
        </Avatar>
        <span className="font-medium">Sarah Johnson</span>
      </Link>
      
      {/* Main Menu Items */}
      <nav>
        <ul className="space-y-1">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link 
                to={item.path} 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <div className="bg-gray-200 rounded-full p-2 mr-3">
                  <item.icon className="h-5 w-5 text-facebook" />
                </div>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          <li>
            <Button variant="ghost" className="w-full justify-start p-2 hover:bg-gray-100">
              <svg 
                className="h-5 w-5 mr-3" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6"></path>
              </svg>
              See More
            </Button>
          </li>
        </ul>
      </nav>
      
      <div className="border-t border-gray-300 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-gray-500 font-medium">Your Groups</h3>
          <Link to="/groups" className="text-facebook hover:bg-blue-50 px-2 py-1 rounded text-sm">
            See All
          </Link>
        </div>
        
        <ul className="space-y-1">
          {groupItems.map(group => (
            <li key={group.id}>
              <Link 
                to={`/groups/${group.id}`} 
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <Avatar className="h-9 w-9 mr-3">
                  <img src={group.image} alt={group.name} />
                </Avatar>
                <span>{group.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <Button className="w-full flex items-center justify-center mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800">
              <svg 
                className="h-5 w-5 mr-2" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Create New Group
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default LeftSidebar;
