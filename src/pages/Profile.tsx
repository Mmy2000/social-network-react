import React from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfilePosts from '../components/profile/ProfilePosts';
import ProfileAbout from '../components/profile/ProfileAbout';
import ProfileFriends from '../components/profile/ProfileFriends';
import ProfilePhotos from '../components/profile/ProfilePhotos';
import UserDataCard from '../components/profile/UserDataCard';
import type { PostType } from '../components/feed/PostCard';

// Mock data for posts
const mockPosts: PostType[] = [
  {
    id: 101,
    user: {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
    },
    content: "Excited to announce that I've just been promoted to Senior Developer! Thanks to everyone who supported me on this journey! 🎉",
    timestamp: '3 days ago',
    likes: 124,
    comments: 48,
    shares: 12,
    liked: true,
  },
  {
    id: 102,
    user: {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
    },
    content: "Beautiful sunset at the beach today!",
    image: 'https://source.unsplash.com/photo-1585158531004-3224babed121',
    timestamp: '1 week ago',
    likes: 87,
    comments: 15,
    shares: 5,
    liked: false,
  },
  {
    id: 102,
    user: {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
    },
    content: "Beautiful sunset at the beach today!",
    image: 'https://source.unsplash.com/photo-1585158531004-3224babed121',
    timestamp: '1 week ago',
    likes: 87,
    comments: 15,
    shares: 5,
    liked: false,
  },
];

// Mock profile data
const mockProfiles = {
  '1': {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
    coverImage: 'https://source.unsplash.com/photo-1494500764479-0c8f2919a3d8',
    friends: 342,
    isCurrentUser: true,
    isFriend: false,
  },
  '2': {
    id: 2,
    name: 'Emma Thompson',
    avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158',
    coverImage: 'https://source.unsplash.com/photo-1507090960745-b32f65d3113a',
    friends: 587,
    isCurrentUser: false,
    isFriend: true,
  },
  '3': {
    id: 3,
    name: 'Michael Lee',
    avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b',
    coverImage: 'https://source.unsplash.com/photo-1471879832106-c7ab9e0cee23',
    friends: 421,
    isCurrentUser: false,
    isFriend: true,
  },
  '4': {
    id: 4,
    name: 'Sophia Garcia',
    avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c',
    coverImage: 'https://source.unsplash.com/photo-1505765050516-f72dcac9c60e',
    friends: 289,
    isCurrentUser: false,
    isFriend: false,
  }
};

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
  const profileId = id || '1';
  
  // Get profile data
  const profile = mockProfiles[profileId as keyof typeof mockProfiles] || mockProfiles['1'];
  
  // Mock profile info
  const profileInfo = {
    work: 'Senior Developer at TechCorp',
    education: 'Computer Science, Stanford University',
    location: 'San Francisco, California',
    joinedDate: 'January 2020'
  };
  
  // Combine profile data with additional info for the fixed card
  const userCardData = {
    ...profile,
    work: profileInfo.work,
    education: profileInfo.education,
    location: profileInfo.location,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Tabs defaultValue="posts" className="w-full">
        <ProfileHeader profile={profile} />
        
        <div className="container px-4 mx-auto max-w-screen-xl py-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Fixed User Data Card */}
            <div className="hidden md:block md:col-span-3">
              <UserDataCard profile={userCardData} />
            </div>
            
            {/* Tabs Content */}
            <div className="md:col-span-9">
              <TabsContent value="posts" className="mt-0 space-y-6">
                <ProfilePosts posts={mockPosts} isCurrentUser={profile.isCurrentUser} />
              </TabsContent>
              
              <TabsContent value="about" className="mt-0">
                <ProfileAbout info={profileInfo} />
              </TabsContent>
              
              <TabsContent value="friends" className="mt-0">
                <ProfileFriends friends={mockFriends} />
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
