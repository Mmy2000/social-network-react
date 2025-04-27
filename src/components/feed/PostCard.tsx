
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

export type PostType = {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
};

interface PostCardProps {
  post: PostType;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      // In a real app, this would submit the comment to an API
      setCommentText('');
      // Increase comment count for visual feedback
      post.comments += 1;
    }
  };

  return (
    <Card className="mb-4 shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Link to={`/profile/${post.user.id}`}>
              <Avatar className="h-10 w-10 mr-3">
                <img src={post.user.avatar} alt={post.user.name} />
              </Avatar>
            </Link>
            <div>
              <Link to={`/profile/${post.user.id}`} className="font-medium hover:underline">
                {post.user.name}
              </Link>
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm mb-3">{post.content}</p>
        {post.image && (
          <div className="rounded-md overflow-hidden bg-gray-100">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full object-cover" 
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}
        
        {/* Like count and comments */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
          <div className="flex items-center">
            {liked && (
              <div className="bg-facebook rounded-full p-1 mr-1">
                <Heart className="h-3 w-3 text-white fill-white" />
              </div>
            )}
            <span>{likeCount > 0 ? `${likeCount} likes` : ''}</span>
          </div>
          <div>
            {post.comments > 0 && (
              <Button 
                variant="ghost" 
                className="h-auto p-0 text-gray-500 hover:text-gray-700" 
                onClick={() => setShowComments(!showComments)}
              >
                {post.comments} comments
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-1">
        <div className="flex w-full">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none"
            onClick={handleLike}
          >
            <Heart 
              className={`h-5 w-5 mr-2 ${liked ? 'text-facebook fill-facebook' : ''}`} 
            />
            Like
          </Button>
          
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comment
          </Button>
          
          <Button variant="ghost" className="flex-1 rounded-none">
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
      
      {showComments && (
        <div className="px-4 py-3 bg-gray-50">
          {/* Comment form */}
          <form onSubmit={handleComment} className="flex mb-3">
            <Avatar className="h-8 w-8 mr-2">
              <img src="https://source.unsplash.com/photo-1649972904349-6e44c42644a7" alt="Current user" />
            </Avatar>
            <div className="flex-1 relative">
              <Textarea 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="min-h-0 h-10 py-2 resize-none bg-white"
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 bottom-1 bg-transparent hover:bg-transparent text-facebook h-8 p-0"
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          </form>
          
          {/* Comment examples (static) */}
          <div className="space-y-3">
            <div className="flex">
              <Avatar className="h-8 w-8 mr-2">
                <img src="https://source.unsplash.com/photo-1488590528505-98d2b5aba04b" alt="Commenter" />
              </Avatar>
              <div className="bg-white rounded-lg px-3 py-2 max-w-[90%]">
                <Link to="/profile/3" className="font-medium text-sm hover:underline">
                  Michael Lee
                </Link>
                <p className="text-sm">Great post! Thanks for sharing this.</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <button className="font-medium hover:underline">Like</button>
                  <button className="font-medium hover:underline">Reply</button>
                  <span>5m</span>
                </div>
              </div>
            </div>
            
            <div className="flex">
              <Avatar className="h-8 w-8 mr-2">
                <img src="https://source.unsplash.com/photo-1581091226825-a6a2a5aee158" alt="Commenter" />
              </Avatar>
              <div className="bg-white rounded-lg px-3 py-2 max-w-[90%]">
                <Link to="/profile/2" className="font-medium text-sm hover:underline">
                  Emma Thompson
                </Link>
                <p className="text-sm">This is exactly what I needed to see today!</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <button className="font-medium hover:underline">Like</button>
                  <button className="font-medium hover:underline">Reply</button>
                  <span>23m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PostCard;
