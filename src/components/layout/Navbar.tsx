import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Bell,
  Home,
  Loader2,
  MessageCircle,
  MoonIcon,
  SunIcon,
  User,
  Users,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SearchInput from "../search/SearchInput";
import NotificationPopover from "../notifications/NotificationPopover";
import { useFriends } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import { Switch } from "../ui/switch";

const Navbar = () => {
  const location = useLocation();
  const { user, setUser } = useUser(); // Accessing user context
  let navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  function LogOut() {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  const getLinkClass = (path: string) => {
    return `px-4 py-2 mx-1 ${
      isActive(path)
        ? "text-facebook border-b-2 border-facebook "
        : "text-gray-600 hover:text-facebook animate-hover dark:text-gray-400"
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    return `px-4 py-2 ${
      isActive(path)
        ? "text-facebook border-b-2 border-facebook "
        : "text-gray-600 dark:text-gray-400"
    } flex flex-col items-center`;
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  const { requests, groupInvitations } = useFriends();
  const { unreadMessages, isLoadingUnreadMessages } = useChat();
  
  return (
    <header className="dark:bg-gradient-to-r dark:from-gray-950 dark:to-gray-900 inset-x-0  w-full sticky z-10 top-0 left-0 border-b border-gray-200 dark:border-gray-900 bg-white/75 backdrop-blur-lg transition-all duration-300 ease-in-out">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4 flex-1">
            <Link to="/" className="text-facebook text-2xl font-bold mr-4">
              Dreem
            </Link>
            <div className="hidden md:block max-w-md w-full">
              <SearchInput />
            </div>
          </div>

          <nav className="flex-grow hidden md:flex items-center justify-center">
            <Link to="/" className={getLinkClass("/")}>
              <Home className="w-6 h-6" />
            </Link>
            <Link
              to="/friends"
              className={`${getLinkClass("/friends")} relative`}
            >
              {(requests.length > 0 || groupInvitations.length > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {requests.length + groupInvitations.length}
                </span>
              )}
              <Users className="w-6 h-6" />
            </Link>
            <Link to="/chat" className={getLinkClass("/chat") + " relative"}>
              {isLoadingUnreadMessages ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="w-6 h-6" />
                  {unreadMessages &&
                    unreadMessages.length > 0 &&
                    unreadMessages.reduce(
                      (total: number, conv: any) => total + conv.unreadCount,
                      0
                    ) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessages.reduce(
                          (total: number, conv: any) =>
                            total + conv.unreadCount,
                          0
                        )}
                      </span>
                    )}
                </>
              )}
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            {user && <NotificationPopover />}
            <Switch
              checked={isDarkMode}
              onClick={toggleDarkMode}
              className={`${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/50"
                  : "bg-gray-300"
              } relative inline-flex items-center h-6 rounded-full w-12 transition-all duration-300 ease-in-out`}
            >
              <span
                className={`${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                } inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300`}
              />
              {isDarkMode ? (
                <MoonIcon className="absolute left-1 w-4 h-4 text-blue-300" />
              ) : (
                <SunIcon className="absolute right-1 w-4 h-4 text-yellow-400" />
              )}
            </Switch>
            {user ? (
              <>
                {!user.isActive && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mr-4 text-yellow-600 cursor-pointer">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>
                          Your account is not active. Please check your email to
                          activate it.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Link to={`/profile/${user.id}`}>
                  <Avatar>
                    <img
                      src={
                        user.profile_pic || "https://via.placeholder.com/150"
                      }
                      alt="User"
                    />
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  className="ml-4 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                  onClick={LogOut} // clear user on logout
                >
                  <Link to="/" className="text-facebook dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-700">
                    Logout
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" className="ml-4 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400">
                  <Link to="/signup" className="text-facebook-light">
                    Sign Up
                  </Link>
                </Button>
                <Button variant="ghost" className="ml-4 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                  <Link to="/login" className="text-facebook dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-700">
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-between px-4">
          <Link to="/" className={getMobileLinkClass("/")}>
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/friends" className={getMobileLinkClass("/friends")}>
            <Users className="w-5 h-5" />
            <span className="text-xs">Friends</span>
          </Link>
          <Link to="/chat" className={getMobileLinkClass("/chat")}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Messages</span>
          </Link>
          <Link to="/profile/1" className={getMobileLinkClass("/profile")}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
