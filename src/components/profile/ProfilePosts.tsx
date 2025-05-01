
import React from 'react';
import CreatePostCard from '../feed/CreatePostCard';
import PostCard from '../feed/PostCard';
import { useQueryClient } from '@tanstack/react-query';

// Mock implementation of updatePostById function
const updatePostById = (postId, updatedData) => {

  const queryClient = useQueryClient();

  queryClient.setQueryData(["posts"], (oldPosts: Array<{ id: string }> = []) =>
    oldPosts.map((post) =>
      post.id === postId ? { ...post, ...updatedData } : post
    )
  );
};


const ProfilePosts = ({ posts, isCurrentUser }) => {
  return (
    <div className="space-y-4">
      {isCurrentUser && <CreatePostCard />}
      {posts?.map(post => (
        <PostCard updatePost={updatePostById} key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ProfilePosts;
