import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfilePosts from "../components/profile/ProfilePosts";
import ProfileAbout from "../components/profile/ProfileAbout";
import ProfileFriends from "../components/profile/ProfileFriends";
import ProfilePhotos from "../components/profile/ProfilePhotos";
import UserDataCard from "../components/profile/UserDataCard";
import ProfileSettings from "../components/profile/ProfileSettings";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestStatus, setFriendRequestStatus] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [userFriends, setUserFriends] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [images, setImages] = useState(null);
  const profileId = id || "";
  const { user } = useUser();
  const {
    friends,
    sendFriendRequest,
    updateFriendRequest,
    removeFriend,
    isLoading,
  } = useFriends();

  const fetchProfileData = async (profileId: string) => {
    setLoading(true);
    try {
      const token = user?.access || null;
      const res = await apiService.get(
        `/accounts/profile/${profileId}/`,
        token
      );

      if (res) {
        setPosts(res?.data?.posts);
        setIsOwner(res?.data?.is_owner);
        setUserData(res?.data?.user_data);
        setImages(res?.data?.photos);
        setIsFriend(res?.data?.is_friend);
        setFriendRequestStatus(res?.data?.friendship_status);
        setFriendsCount(res?.data?.friends?.count);
        setUserFriends(res?.data?.friends?.users);
        setFollowersCount(res?.data?.followers?.count);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.access && !localStorage.getItem("access")) {
      fetchProfileData(profileId);
    } else {
      fetchProfileData(profileId);
    }
  }, [profileId, user]);

  const handleSendFriendRequest = async () => {
    await sendFriendRequest(userData?.id);
    setFriendRequestStatus("sent");
  };

  const handleUpdateFriendRequest = async (status: "accepted" | "rejected") => {
    await updateFriendRequest({
      requestId: userData?.friend_request_id,
      status,
    });
    if (status === "accepted") {
      setIsFriend(true);
      setFriendRequestStatus(null);
      setFriendsCount((prev) => prev + 1);
    } else {
      setFriendRequestStatus(null);
    }
  };

  const handleRemoveFriend = async () => {
    await removeFriend(userData?.id);
    setIsFriend(false);
    setFriendRequestStatus(null);
    setFriendsCount((prev) => prev - 1);
  };

  const handleUpdatePost = (postId, updatedData) => {
    setPosts((prevPosts) => {
      if (!updatedData) {
        // Post was deleted – remove it from the list
        return prevPosts.filter((post) => post.id !== postId);
      }
      // Post was updated – update it in the list
      return prevPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      );
    });
  };

  const handleNewPost = async () => {
    await fetchProfileData(profileId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center mt-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Tabs defaultValue="posts" className="w-full">
        <ProfileHeader
          follwersCount={followersCount}
          isFriend={isFriend}
          friendsCount={friendsCount}
          profile={userData}
          isCurrentUser={isOwner}
          friendRequestStatus={friendRequestStatus}
          onProfileUpdated={setUserData}
          onSendFriendRequest={handleSendFriendRequest}
          onUpdateFriendRequest={handleUpdateFriendRequest}
          onRemoveFriend={handleRemoveFriend}
          isLoading={isLoading}
        />

        <div className="container px-4 mx-auto max-w-screen-xl py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Fixed User Data Card */}
            <div className="hidden md:block md:col-span-4">
              <UserDataCard profile={userData} />
            </div>

            {/* Tabs Content */}
            <div className="md:col-span-8">
              <TabsContent value="posts" className="mt-0 space-y-6">
                <ProfilePosts
                  posts={posts}
                  isCurrentUser={isOwner}
                  updatePost={handleUpdatePost}
                  onPostCreated={handleNewPost}
                />
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <ProfileAbout info={userData} />
              </TabsContent>

              <TabsContent value="friends" className="mt-0">
                <ProfileFriends friends={userFriends} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <ProfilePhotos images={images} />
              </TabsContent>
              <TabsContent value="settings" className="mt-0">
                <ProfileSettings />
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Profile;
