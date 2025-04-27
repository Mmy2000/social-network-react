
import React from 'react';
import CreatePostCard from './CreatePostCard';
import PostCard, { PostType } from './PostCard';

// Mock data for posts
const mockPosts: PostType[] = [
  {
    id: 1,
    user: {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
    },
    content: "Just finished reading this amazing book on artificial intelligence! It's incredible how technology is evolving. What are you all reading these days?",
    timestamp: 'Just now',
    likes: 15,
    comments: 3,
    shares: 1,
    liked: false,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: 'Emma Thompson',
      avatar: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158',
    },
    content: "Beautiful day at the beach! 🌊☀️",
    image: 'https://source.unsplash.com/photo-1507525428034-b723cf961d3e',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 7,
    shares: 3,
    liked: true,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: 'Michael Lee',
      avatar: 'https://source.unsplash.com/photo-1488590528505-98d2b5aba04b',
    },
    content: "Just completed my first marathon! It was an incredible experience. Thanks to everyone who supported me along the way. Looking forward to the next challenge!",
    image: 'https://source.unsplash.com/photo-1452626038306-9aae5e071dd3',
    timestamp: '5 hours ago',
    likes: 89,
    comments: 15,
    shares: 5,
    liked: false,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: 'Sophia Garcia',
      avatar: 'https://source.unsplash.com/photo-1519389950473-47ba0277781c',
    },
    content: "Just launched my new website! Check it out and let me know what you think. It's been months of hard work, but I'm really proud of the result.",
    timestamp: 'Yesterday',
    likes: 31,
    comments: 12,
    shares: 4,
    liked: true,
  },
];

const Feed: React.FC = () => {
  const [posts, setPosts] = React.useState<PostType[]>(mockPosts);
  
  const handleNewPost = () => {
    // In a real app, this would fetch the latest posts from the API
    // For demo purposes, we'll just add a dummy post at the top
    const newPost: PostType = {
      id: Date.now(),
      user: {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7',
      },
      content: "Just shared a new post! This is a static example.",
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
    };
    
    setPosts([newPost, ...posts]);
  };
  
  return (
    <div className="max-w-xl mx-auto py-4">
      <CreatePostCard onPostCreated={handleNewPost} />
      
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
