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
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [role, setRole] = useState("public");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [feeling , setFeeling] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

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

    if (!content.trim()) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("role", role);
    formData.append("feeling",feeling);
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    try {
       const res = await apiService.postNewPost(
         "/posts/create/",
         formData,
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
    <Card className="mb-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex">
            <Avatar className="h-10 w-10 mr-3">
              <img src={user?.profile_pic} alt={user?.first_name} />
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="mt-4">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Post visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="only_me">Only Me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview selected files */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {attachments.map((file, index) => (
                <div key={index}>{file.name}</div>
              ))}
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="p-4 flex justify-between">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              className="flex items-center"
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
            <Button type="button" variant="ghost" className="flex items-center">
              <Smile className="h-5 w-5 mr-2 text-yellow-500" />
              <Select value={feeling} onValueChange={setFeeling}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Feeling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="tired">Tired</SelectItem>
                </SelectContent>
              </Select>
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
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
