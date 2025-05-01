import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePosts from '../components/profile/ProfilePosts';
import ProfileAbout from '../components/profile/ProfileAbout';
import ProfileFriends from '../components/profile/ProfileFriends';
import ProfilePhotos from '../components/profile/ProfilePhotos';
import UserDataCard from '../components/profile/UserDataCard';
import apiService from '@/apiService/apiService';
import { useUser } from '@/context/UserContext';


// Mock data for photos
const mockPhotos = [
  { id: 1, url: 'https://source.unsplash.com/photo-1494500764479-0c8f2919a3d8', description: 'Mountain sunset' },
  { id: 2, url: 'https://source.unsplash.com/photo-1507090960745-b32f65d3113a', description: 'City lights' },
  { id: 3, url: 'https://source.unsplash.com/photo-1471879832106-c7ab9e0cee23', description: 'Beach waves' },
];

// Mock friends data
const mockFriends = [
  { id: 2, name: 'Emma Thompson', avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: 3, name: 'Michael Lee', avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: 4, name: 'Sophia Garcia', avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c' },
];

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState(null);
  const [follwers, setFollwers] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const profileId = id || '';
  const {user} = useUser()
  console.log("id", id);

  const fetchProfileData = async (profileId: string) => {
    setLoading(true);
    try {
      const token = user?.access || null;
      const res = await apiService.get(
        `/accounts/profile/${profileId}/`,
        token
      );
      console.log("Profile data:", res);

      if (res) {
        setFriends(res?.data?.friends);
        setFollwers(res?.data?.followers);
        setPosts(res?.data?.posts);
        setIsOwner(res?.data?.is_owner);
        setUserData(res?.data?.user_data);
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
    }else {
      fetchProfileData(profileId);
    }
  }, [profileId, user]);

  const handleUpdatePost = (postId, updatedData) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      )
    );
  };


  console.log("friends", friends);
  console.log("follwers", follwers);
  console.log("posts", posts);
  console.log("isOwner", isOwner);
  console.log("userData", userData);
  

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Tabs defaultValue="posts" className="w-full">
        <ProfileHeader profile={userData} isCurrentUser={isOwner} />

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
                />
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <ProfileAbout info={userData} />
              </TabsContent>

              <TabsContent value="friends" className="mt-0">
                <ProfileFriends friends={friends} />
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <ProfilePhotos photos={mockPhotos} />
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Profile;
