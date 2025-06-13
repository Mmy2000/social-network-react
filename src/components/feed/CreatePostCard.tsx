import React, { useState, useRef } from "react";
import axios from "axios";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import apiService from "@/apiService/apiService";
import { Spinner } from "../ui/Spinner";

interface CreatePostCardProps {
  onPostCreated?: () => void;
  groupId?: string;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated, groupId }) => {
  const [content, setContent] = useState("");
  const [role, setRole] = useState("public");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [feeling , setFeeling] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const feelingEmojis = {
    happy: "😊",
    sad: "😢",
    excited: "🤩",
    tired: "😴",
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "You need to be logged in to reply to a comment.",
        variant: "warning",
      });
      return;
    }

    if (!content.trim()) return;
    setIsSubmitting(true);
    const formDataInGroup = new FormData();
    formDataInGroup.append("content", content);
    formDataInGroup.append("role", role);
    formDataInGroup.append("group", groupId);
    formDataInGroup.append("feeling",feeling);
    attachments.forEach((file) => {
      formDataInGroup.append("attachments", file);
    });
    const formDataOnFeed = new FormData();
    formDataOnFeed.append("content", content);
    formDataOnFeed.append("role", role);
    formDataOnFeed.append("feeling",feeling);
    attachments.forEach((file) => {
      formDataOnFeed.append("attachments", file);
    });

    try {
       const res = await apiService.postNewPost(
         "/posts/create/",
         groupId ? formDataInGroup : formDataOnFeed,
         user?.access
       );

      setContent("");
      setRole("public");
      setAttachments([]);
      setFeeling("")

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
        variant: "success",
      });
      console.log(res);
      
      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-4 shadow-sm dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                <img src={user?.profile_pic} alt={user?.first_name} />
              </Avatar>
              {/* Role selector */}
              <div className="">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                    <SelectValue placeholder="Post visibility" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                    <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300 " value="public">Public</SelectItem>
                    <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300" value="only_me">Only Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 mt-4">
              <Textarea
                placeholder="What's on your mind?"
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-0 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Preview selected files */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              {attachments.map((file, index) => (
                <div key={index}>{file.name}</div>
              ))}
            </div>
          )}
        </CardContent>

        <Separator className="dark:bg-gray-700" />

        <CardFooter className="p-4 flex justify-between ">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              className="flex items-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              onClick={handleFileButtonClick}
            >
              <Image className="h-5 w-5 mr-2 text-green-500" />
              <span className="hidden sm:inline">Photo/Video</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button type="button" variant="ghost" className="flex items-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
              <Smile className="h-5 w-5 mr-2 text-yellow-500" />
              <Select value={feeling} onValueChange={setFeeling}>
                <SelectTrigger className="w-40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                  <SelectValue placeholder="Feeling" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                  <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300" value="happy">
                    {feelingEmojis.happy} Happy
                  </SelectItem>
                  <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300" value="sad">
                    {feelingEmojis.sad} Sad
                  </SelectItem>
                  <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300" value="excited">
                    {feelingEmojis.excited} Excited
                  </SelectItem>
                  <SelectItem className="dark:hover:bg-gray-800 dark:hover:text-gray-300" value="tired">
                    {feelingEmojis.tired} Tired
                  </SelectItem>
                </SelectContent>
              </Select>
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 dark
              isSubmitting || !content.trim()
                ? "bg-facebook/60 cursor-not-allowed"
                : "bg-facebook hover:bg-facebook-dark"
            }`}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostCard;
