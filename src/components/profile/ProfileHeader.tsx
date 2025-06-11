import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Edit,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Settings,
  UserMinus,
  Loader2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import EditProfileForm from "./EditProfileForm";
import { useChat } from "@/hooks/useChat";

interface ProfileHeaderProps {
  profile: any;
  isCurrentUser: boolean;
  friendsCount: number;
  follwersCount: number;
  isFriend: boolean;
  friendRequestStatus: string;
  onProfileUpdated: (data: any) => void;
  onSendFriendRequest: () => void;
  onUpdateFriendRequest: (status: "accepted" | "rejected") => void;
  onRemoveFriend: () => void;
  isLoading: (userId: number) => boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isCurrentUser,
  friendsCount,
  follwersCount,
  isFriend,
  friendRequestStatus,
  onProfileUpdated,
  onSendFriendRequest,
  onUpdateFriendRequest,
  onRemoveFriend,
  isLoading,
}) => {
  const { user } = useUser();
  const [openEdit, setOpenEdit] = useState(false);
  const { startConversation } = useChat();
  const [isStartingChat, setIsStartingChat] = useState(false);  

  const handleStartChat = async () => {
    if (!profile?.id) return;
    setIsStartingChat(true);
    try {
      await startConversation(profile.id);
    } finally {
      setIsStartingChat(false);
    }
  };

  const renderFriendshipButton = () => {
    if (isCurrentUser) {
      return (
        <Button variant="outline" onClick={() => setOpenEdit(true)} className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      );
    }

    // If they are already friends
    if (isFriend) {
      return (
        <>
          <Button
            variant="outline"
            className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
            onClick={onRemoveFriend}
            disabled={isLoading(profile?.id)}
          >
            {isLoading(profile?.id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {isLoading(profile?.id) ? "Removing..." : "Friends"}
          </Button>
        </>
      );
    }

    // If there's a pending friend request
    if (friendRequestStatus === "received") {
      
      return (
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
            onClick={() => {
              console.log(
                "Accepting friend request. Status:",
                friendRequestStatus
              );
              onUpdateFriendRequest("accepted");
            }}
            disabled={isLoading(profile?.id)}
          >
            {isLoading(profile?.id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            {isLoading(profile?.id) ? "Accepting..." : "Accept"}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
            onClick={() => {
              console.log(
                "Rejecting friend request. Status:",
                friendRequestStatus
              );
              onUpdateFriendRequest("rejected");
            }}
            disabled={isLoading(profile?.id)}
          >
            {isLoading(profile?.id) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserX className="h-4 w-4" />
            )}
            {isLoading(profile?.id) ? "Declining..." : "Decline"}
          </Button>
        </div>
      );
    }

    // If we've sent them a request
    if (friendRequestStatus === "sent") {
      return (
        <Button
          variant="outline"
          className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
          disabled={true}
        >
          <UserPlus className="h-4 w-4" />
          Request Sent
        </Button>
      );
    }

    // If no friendship exists
    return (
      <Button
        variant="default"
        className="flex items-center gap-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
        onClick={onSendFriendRequest}
        disabled={isLoading(profile?.id)}
      >
        {isLoading(profile?.id) ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        {isLoading(profile?.id) ? "Sending..." : "Add Friend"}
      </Button>
    );
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-b-lg dark:bg-gray-900 dark:text-gray-300">
        {/* Cover Photo */}
        <div
          className="h-48 sm:h-64 md:h-80 bg-gray-300 mx-8 relative rounded-b-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${profile?.profile?.cover_picture})` }}
        >
          {isCurrentUser && (
            <Button
              variant="secondary"
              onClick={() => setOpenEdit(true)}
              size="default"
              className="absolute bottom-4 right-4 bg-white/80 hover:bg-white dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover Photo
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="container mt-4 px-4 mx-auto max-w-screen-xl dark:text-gray-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-end relative -mt-12 sm:-mt-16 md:-mt-20 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <img
                  src={profile?.profile?.profile_picture}
                  alt={profile?.profile?.name}
                />
              </Avatar>
              {isCurrentUser && (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setOpenEdit(true)}
                  className="absolute bottom-0 right-0 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Name and stats */}
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {profile?.profile?.full_name}
              </h1>
              <div className="flex">
                <p className="text-gray-500 dark:text-gray-400">
                  <span className="text-facebook font-medium">
                    {friendsCount}
                  </span>{" "}
                  friends
                </p>
                <p className="text-gray-500 ml-4 dark:text-gray-400">
                  <span className="text-facebook font-medium">
                    {follwersCount}
                  </span>{" "}
                  followers
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              {renderFriendshipButton()}
              {!isCurrentUser && (
                <Button
                  className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:border-gray-700"
                  variant="outline"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                >
                  {isStartingChat ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  )}
                  {isStartingChat ? "Starting..." : "Message"}
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 mt-4 dark:border-gray-700 ">
            <TabsList className="w-full justify-start h-12 px-0 bg-transparent border-b rounded-none dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              <TabsTrigger
                value="posts"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200  "
              >
                Photos
              </TabsTrigger>
              {isCurrentUser && (
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-200"
                >
                  Settings
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>
      </div>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
          <DialogHeader className="px-6 py-4 border-b dark:border-gray-700">
            <DialogTitle className="text-2xl font-bold dark:text-gray-300">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <EditProfileForm
              profile={profile}
              onClose={() => setOpenEdit(false)}
              onProfileUpdated={onProfileUpdated}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileHeader;
