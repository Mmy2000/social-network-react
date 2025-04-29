
import React, { useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Smile } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';


interface CreatePostCardProps {
  onPostCreated?: () => void;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser(); // Accessing user context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would send data to your API
      setContent('');
      setIsSubmitting(false);
      
      // Notify the parent component about the new post
      if (onPostCreated) {
        onPostCreated();
      }
      
      toast({
        title: "Post created!",
        description: "Your post has been published successfully."
      });
    }, 1000);
  };

  return (
    <Card className="mb-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex">
            <Avatar className="h-10 w-10 mr-3">
              <img src={user?.profile_pic} alt={user?.first_name} />
            </Avatar>
            <div className="flex-1">
              <Textarea 
                placeholder="What's on your mind, Sarah?"
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-0"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardFooter className="p-4 flex justify-between">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" className="flex items-center">
              <Image className="h-5 w-5 mr-2 text-green-500" />
              <span className="hidden sm:inline">Photo</span>
            </Button>
            <Button type="button" variant="ghost" className="flex items-center">
              <Video className="h-5 w-5 mr-2 text-red-500" />
              <span className="hidden sm:inline">Video</span>
            </Button>
            <Button type="button" variant="ghost" className="flex items-center">
              <Smile className="h-5 w-5 mr-2 text-yellow-500" />
              <span className="hidden sm:inline">Feeling</span>
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
            className="bg-facebook hover:bg-facebook-dark"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostCard;
