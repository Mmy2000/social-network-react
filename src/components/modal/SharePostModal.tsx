import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader, Smile } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import SharedPostCard from "../feed/SharedPostCard";
import { useQuery } from "@tanstack/react-query";
import apiService from "@/apiService/apiService";

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: {
    content: string;
    feeling: string;
    role: string;
    originalPostId: string;
  }) => Promise<void>;
  postID: string;
}

const SharePostModal: React.FC<SharePostModalProps> = ({
  isOpen,
  onClose,
  onShare,
  postID,
}) => {
  const [content, setContent] = useState("");
  const [role, setRole] = useState("public");
  const [feeling, setFeeling] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPostId, setOriginalPostId] = useState(postID);

  // Fetch post details to check if it's a shared post
  const { data: post } = useQuery({
    queryKey: ["post", postID],
    queryFn: async () => {
      const response = await apiService.get(`/posts/${postID}`);
      return response.data;
    },
    enabled: !!postID,
  });

  // Update originalPostId when post data is available
  useEffect(() => {
    if (post?.shared_from) {
      setOriginalPostId(post.shared_from);
    }
  }, [post]);

  const handleShare = async () => {
    setIsSubmitting(true);
    try {
      await onShare({
        content,
        feeling,
        role,
        originalPostId,
      });
      setContent("");
      setRole("public");
      setFeeling("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-40 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Post visibility" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" value="public">Public</SelectItem>
                <SelectItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" value="only_me">Only Me</SelectItem>
              </SelectContent>
            </Select>

            <Select value={feeling} onValueChange={setFeeling}>
              <SelectTrigger className="w-40 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Feeling">
                  {feeling ? (
                    <span className="flex items-center">
                      <Smile className="w-4 h-4 mr-2" />
                      {feeling}
                    </span>
                  ) : (
                    "Feeling"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectItem value="happy" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😊 Happy</SelectItem>
                <SelectItem value="sad" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😢 Sad</SelectItem>
                <SelectItem value="excited" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">🤩 Excited</SelectItem>
                <SelectItem value="tired" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😴 Tired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Textarea
            placeholder="Write something about this post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />

          <div className=" rounded-lg overflow-hidden">
            <SharedPostCard postID={originalPostId} />
          </div>
        </div>

        <DialogFooter>
          <Button className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            disabled={isSubmitting}
            className="flex items-center gap-2 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
          >
            {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sharing..." : "Share Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;
