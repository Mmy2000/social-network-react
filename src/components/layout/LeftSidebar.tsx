import { useState } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Bookmark,
  Calendar,
  Video,
  Image,
  Heart,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import apiService from "@/apiService/apiService";
import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "../ui/scroll-area";

const menuItems = [
  { icon: Users, label: "Friends", path: "/friends" },
  { icon: Clock, label: "Memories", path: "/memories" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: Video, label: "Videos", path: "/videos" },
  { icon: Image, label: "Photos", path: "/photos" },
  { icon: Heart, label: "Favorites", path: "/favorites" },
];

const LeftSidebar = () => {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const { user } = useUser();

  const { data: myGroups } = useQuery({
    queryKey: ["groups", "my_groups"],
    queryFn: () => apiService.get("/groups/?filter=my_groups", user?.access),
    enabled: !!user?.access, // Only run query if user is logged in
  });

  return (
    <ScrollArea
      className="hidden md:block w-[280px] p-4 space-y-4"
      style={{ maxHeight: "calc(100vh - 64px)" }}
    >
      {user ?
      <Link
        to={`/profile/${user?.id}`}
        className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
      >
        <Avatar className="h-9 w-9 mr-3">
          <img src={user?.profile_pic} alt={user?.first_name} />
        </Avatar>
        <span className="font-medium">
          {user?.first_name} {user?.last_name}
        </span>
      </Link>:(
        <p className="text-gray-500 mb-2">Please login to show your profile <Link to="/login" className="text-facebook">Login</Link></p>
      )}
      

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
            <Button
              variant="ghost"
              className="w-full justify-start p-2 hover:bg-gray-100"
            >
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
          <Link
            to="/groups"
            className="text-facebook hover:bg-blue-50 px-2 py-1 rounded text-sm"
          >
            See All
          </Link>
        </div>

        <ul className="space-y-1">
          {myGroups?.data?.map((group) => (
            <li key={group.id}>
              <Link
                to={`/groups/${group.id}`}
                className="flex items-center p-2 rounded-md hover:bg-gray-100 animate-hover"
              >
                <Avatar className="h-9 w-9 mr-3">
                  <img src={group.cover_image} alt={group.name} />
                </Avatar>
                <span>{group.name}</span>
              </Link>
            </li>
          ))}
          <li>
            <Button
              className="w-full flex items-center justify-center mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800"
              onClick={() => setIsCreateGroupModalOpen(true)}
            >
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
      <CreateGroupModal
        open={isCreateGroupModalOpen}
          onClose={() => setIsCreateGroupModalOpen(false)}
        />
    </ScrollArea>
  );
};

export default LeftSidebar;
