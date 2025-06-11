import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Bookmark,
  Star,
  Flag,
  Copy,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";
import ConfirmModal from "../modal/ConfirmModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { useToast } from "./use-toast";
import { usePost } from "@/hooks/usePost";
import SharedPostCard from "../feed/SharedPostCard";
import { useQueryClient } from "@tanstack/react-query";

const PostOptionsDropdown = ({ post, updatePost }) => {
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [editedContent, setEditedContent] = useState(post.content || "");
  const [existingAttachments, setExistingAttachments] = useState(
    post.attachments || []
  );
  const [newAttachments, setNewAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(post.role || "public");
  const [feeling, setFeeling] = useState(post.feeling || "");
  const { user } = useUser();
  const { toast } = useToast();
  const { savePostMutation, favoritePostMutation, sharePostMutation } =
    usePost();
  const queryClient = useQueryClient();

  const handleSavePost = async () => {
    try {
      const response = await savePostMutation.mutateAsync(post.id);
      toast({
        title: "Saved posts updated",
        description: response?.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to save the post.",
        variant: "error",
      });
    }
  };

  const handleFavoritePost = async () => {
    try {
      const response = await favoritePostMutation.mutateAsync(post.id);
      toast({
        title: "Favorites updated",
        description: response?.message,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to add the post to favorites.",
        variant: "error",
      });
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied",
      description: "Post link has been copied to clipboard.",
      variant: "success",
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    if (modalType === "edit") {
      const formData = new FormData();
      formData.append("content", editedContent);
      formData.append("role", role);
      formData.append("feeling", feeling);

      newAttachments.forEach((file) => {
        formData.append("attachments", file);
      });

      existingAttachments.forEach((item) => {
        formData.append("existing_attachments", item.id);
      });

      try {
        const updated = await apiService.put(
          `/posts/${post.id}/update/`,
          formData,
          user?.access
        );
        updatePost(post.id, updated?.data);
        toast({
          title: "Post updated",
          description: "Your post has been successfully updated.",
          variant: "success",
          duration: 3000,
        });
        setLoading(false);
      } catch (error) {
        console.error("Error updating post:", error);
        toast({
          title: "Error",
          description: "There was an error updating your post.",
          variant: "error",
          duration: 3000,
        });
        setLoading(false);
      }
    } else if (modalType === "delete") {
      setLoading(true);
      try {
        await apiService.delete(`/posts/${post.id}/`, user?.access);
        setLoading(false);

        // Update all relevant caches
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
        queryClient.invalidateQueries({ queryKey: ["favorite-posts"] });
        queryClient.invalidateQueries({
          queryKey: ["post", post.id.toString()],
        });
        queryClient.invalidateQueries({ queryKey: ["profile-posts"] });
        queryClient.invalidateQueries({ queryKey: ["user-feed"] });

        // Update local state
        updatePost(post.id, null);

        toast({
          title: "Post Deleted",
          description: "Your post has been successfully deleted.",
          variant: "success",
          duration: 3000,
        });
      } catch (error) {
        console.log("Delete error:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to delete the post.",
          variant: "error",
          duration: 3000,
        });
        setLoading(false);
      }
      setModalType(null);
    }
    setModalType(null);
  };

  const handleNewAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...files]);
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewAttachment = (index) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
          {user?.id === post?.created_by?.id ? (
            <>
              <DropdownMenuItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" onClick={() => setModalType("edit")}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit post
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setModalType("delete")}
                className="text-red-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          ) : null}

          <DropdownMenuItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" onClick={handleSavePost}>
            <Bookmark className="h-4 w-4 mr-2" />
            {post?.is_saved ? "Remove from saved" : "Save post"}
          </DropdownMenuItem>

          <DropdownMenuItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" onClick={handleFavoritePost}>
            <Star className="h-4 w-4 mr-2" />
            {post?.is_favorited ? "Remove from favorites" : "Add to favorites"}
          </DropdownMenuItem>

          <DropdownMenuItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" onClick={handleCopyLink}>
            <LinkIcon className="h-4 w-4 mr-2" />
            Copy link
          </DropdownMenuItem>

          <DropdownMenuItem className="dark:hover:bg-gray-700 dark:hover:text-gray-200" onClick={() => window.print()}>
            <Copy className="h-4 w-4 mr-2" />
            Print post
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-red-600 dark:hover:bg-gray-700 dark:hover:text-gray-200">
            <Flag className="h-4 w-4 mr-2" />
            Report post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        open={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === "edit" ? "Edit Post" : "Delete Post"}
        content={
          modalType === "delete"
            ? "Are you sure you want to delete this post? This action is permanent."
            : "Update your post details below"
        }
        confirmText={modalType === "edit" ? "Save Changes" : "Delete"}
        onConfirm={handleConfirm}
        loading={loading}
        isEdit={modalType === "edit"}
      >
        {modalType === "edit" && (
          <div className="space-y-6">
            {/* Post Content Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Post Content</Label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="What's on your mind?"
              />
            </div>

            {/* Post Settings Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Visibility</Label>
                <Select value={role} onValueChange={(val) => setRole(val)}>
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 ">
                    <SelectItem value="public" className="dark:hover:bg-gray-700 dark:hover:text-gray-200 ">
                      <div className="flex items-center ">
                        <span className="mr-2">🌎</span> Public
                      </div>
                    </SelectItem>
                    <SelectItem value="only_me" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">
                      <div className="flex items-center">
                        <span className="mr-2">🔒</span> Only Me
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Feeling</Label>
                <Select
                  value={feeling}
                  onValueChange={(val) => setFeeling(val)}
                >
                  <SelectTrigger className="w-full dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                    <SelectItem value="happy" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😊 Happy</SelectItem>
                    <SelectItem value="sad" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😢 Sad</SelectItem>
                    <SelectItem value="excited" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">🤩 Excited</SelectItem>
                    <SelectItem value="tired" className="dark:hover:bg-gray-700 dark:hover:text-gray-200">😴 Tired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Attachments Section - Only show if not a shared post */}
            {!post?.shared_from && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Media Attachments
                  </Label>
                  <Input
                    type="file"
                    multiple
                    onChange={handleNewAttachmentChange}
                    className="w-auto text-sm"
                    accept="image/*,video/*"
                  />
                </div>

                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">
                      Current Media
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {existingAttachments.map((url, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={url.image}
                            alt={`attachment-${index}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => removeExistingAttachment(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Attachments Preview */}
                {newAttachments.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">New Media</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {newAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200" />
                          <button
                            type="button"
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => removeNewAttachment(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show shared post preview if it's a shared post */}
            {post?.shared_from && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Shared Post</Label>
                <div className="rounded-lg overflow-hidden">
                  <SharedPostCard postID={post.shared_from} />
                </div>
              </div>
            )}
          </div>
        )}
      </ConfirmModal>
    </>
  );
};

export default PostOptionsDropdown;
