
import React from 'react';
import CreatePostCard from '../feed/CreatePostCard';
import PostCard, { PostType } from '../feed/PostCard';

interface ProfilePostsProps {
  posts: PostType[];
  isCurrentUser: boolean;
}

const ProfilePosts = ({ posts, isCurrentUser }: ProfilePostsProps) => {
  return (
    <div className="space-y-4">
      {isCurrentUser && <CreatePostCard />}
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default ProfilePosts;
