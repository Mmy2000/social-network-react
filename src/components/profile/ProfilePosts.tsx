
import React from 'react';
import CreatePostCard from '../feed/CreatePostCard';
import PostCard from '../feed/PostCard';
import { useQueryClient } from '@tanstack/react-query';


const ProfilePosts = ({ posts, isCurrentUser, updatePost, onPostCreated }) => {
  return (
    <div className="space-y-4 ">
      {isCurrentUser && <CreatePostCard onPostCreated={onPostCreated} />}
      {posts?.map((post) => (
        <PostCard updatePost={updatePost} key={post?.id} post={post} />
      ))}
    </div>
  );
};

export default ProfilePosts
