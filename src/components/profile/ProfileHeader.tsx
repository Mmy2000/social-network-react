
import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Edit, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { useFriend } from '@/context/FriendContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import EditProfileForm from './EditProfileForm';


const ProfileHeader = ({
  profile,
  isCurrentUser,
  friendsCount,
  follwersCount,
  isFriend,
  FriendRequestStatus,
  onProfileUpdated,
}) => {
  const { sendFriendRequest, loadingBtn } = useFriend();
  const [openEdit, setOpenEdit] = useState(false);

  return (
    <>
      <div className="bg-white shadow-sm rounded-b-lg">
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
              className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Edit Cover Photo
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-4 pt-4 md:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end relative -mt-12 sm:-mt-16 md:-mt-20 mb-4">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow">
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
                  className="absolute bottom-0 right-0 rounded-full bg-gray-200 hover:bg-gray-300"
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
                <p className="text-gray-500">
                  <span className="text-blue-600 font-medium">
                    {friendsCount}
                  </span>{" "}
                  friends
                </p>
                <p className="text-gray-500 ml-4">
                  <span className="text-blue-600 font-medium">
                    {follwersCount}
                  </span>{" "}
                  followers
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 sm:mt-0 flex gap-2">
              {isCurrentUser ? (
                <Button variant="outline" onClick={() => setOpenEdit(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {FriendRequestStatus === "accepted" ? (
                    <Button variant="outline">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Friends
                    </Button>
                  ) : FriendRequestStatus === "sent" ? (
                    <Button variant="outline" disabled>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Request Sent
                    </Button>
                  ) : FriendRequestStatus === "received" ? (
                    <Button variant="outline" disabled>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Requested You
                    </Button>
                  ) : (
                    <Button
                      className="bg-facebook hover:bg-facebook-dark"
                      onClick={() => sendFriendRequest(profile?.id)}
                      disabled={loadingBtn}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {loadingBtn ? "Sending..." : "Add Friend"}
                    </Button>
                  )}

                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-200 mt-4">
            <TabsList className="w-full justify-start h-12 px-0 bg-transparent border-b rounded-none">
              <TabsTrigger
                value="posts"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="friends"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="data-[state=active]:border-b-2 data-[state=active]:border-facebook rounded-none data-[state=active]:shadow-none h-12"
              >
                Photos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto ">
          <DialogHeader></DialogHeader>

          <EditProfileForm
            profile={profile}
            onClose={() => setOpenEdit(false)}
            onProfileUpdated={onProfileUpdated}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileHeader;
