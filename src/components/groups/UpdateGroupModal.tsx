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
import { useParams } from "react-router-dom";

interface UpdateGroupModalProps {
  group: any;
  open: boolean;
  onClose: () => void;
}

const UpdateGroupModal: React.FC<UpdateGroupModalProps> = ({
  group,
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description,
    privacy: group.privacy || "false",
    cover_image: null as File | null,
  });
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const { id } = useParams();


  const updateGroupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiService.put(`/groups/${group.id}/`, data, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });

      toast({
        title: "Success",
        description: "Group updated successfully",
        variant: "success",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update group",
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
    formDataToSend.append("is_private", formData.privacy);

    if (formData.cover_image instanceof File) {
      formDataToSend.append("cover_image", formData.cover_image);
    }

    updateGroupMutation.mutate(formDataToSend);
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
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Make changes to your group's information.
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
              <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                <SelectItem value="false" className="dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700">Public</SelectItem>
                <SelectItem value="true" className="dark:text-gray-300 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700">Private</SelectItem>
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
              className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            />
            {group.cover_image && (
              <div className="mt-2">
                <img
                  src={group.cover_image}
                  alt="Current cover"
                  className="w-full h-32 object-cover rounded-md"
                />
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  Current cover image
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateGroupMutation.isPending}
              className="min-w-[100px] bg-facebook text-white hover:bg-facebook-dark"
            >
              {updateGroupMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupModal;
