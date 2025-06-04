import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Bell,
  Home,
  MessageCircle,
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

const Navbar = () => {
  const location = useLocation();
  const { user, setUser } = useUser(); // Accessing user context
  let navigate = useNavigate();

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
        ? "text-facebook border-b-2 border-facebook"
        : "text-gray-600 hover:text-facebook animate-hover"
    }`;
  };

  const getMobileLinkClass = (path: string) => {
    return `px-4 py-2 ${
      isActive(path)
        ? "text-facebook border-b-2 border-facebook"
        : "text-gray-600"
    } flex flex-col items-center`;
  };

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
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
            <Link to="/friends" className={getLinkClass("/friends")}>
              <Users className="w-6 h-6" />
            </Link>
            <Link to="/chat" className={getLinkClass("/chat")}>
              <MessageCircle className="w-6 h-6" />
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            {user && <NotificationPopover />}
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
                  className="ml-4"
                  onClick={LogOut} // clear user on logout
                >
                  <Link to="/" className="text-facebook">
                    Logout
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" className="ml-4">
                  <Link to="/signup" className="text-facebook-light">
                    Sign Up
                  </Link>
                </Button>
                <Button variant="ghost" className="ml-4">
                  <Link to="/login" className="text-facebook">
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
