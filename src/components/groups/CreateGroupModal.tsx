import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { Loader } from "lucide-react";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose,
}) => {
  const { toast } = useToast();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "public",
    cover_image: null as File | null,
  });
  
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiService.postNewPost("/groups/", data, user?.access);
    },
    onSuccess: () => {
      // Invalidate all group queries
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Success",
        description: "Group created successfully",
        variant: "success",
      });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create group",
        variant: "error",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "error",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("privacy", formData.privacy);

    // Only append cover_image if a file is selected
    if (formData.cover_image instanceof File) {
      formDataToSend.append("cover_image", formData.cover_image);
    }

    createGroupMutation.mutate(formDataToSend);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      privacy: "public",
      cover_image: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        cover_image: file,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Create a new group to connect with people who share your interests.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="What's your group about?"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select
              value={formData.privacy}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, privacy: value }))
              }
            >
              <SelectTrigger className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectValue placeholder="Select privacy setting" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 ">
                <SelectItem value="public" className="dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700">Public</SelectItem>
                <SelectItem value="private" className="dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image">Cover Image</Label>
            <Input
              id="cover_image"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGroupMutation.isPending}
              className="min-w-[100px] bg-facebook text-white hover:bg-facebook-dark"
            >
              {createGroupMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
