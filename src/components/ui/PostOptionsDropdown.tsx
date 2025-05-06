import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
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



const PostOptionsDropdown = ({ post, updatePost }) => {
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [editedContent, setEditedContent] = useState(post.content || "");
  const [existingAttachments, setExistingAttachments] = useState(
    post.attachments || []
  );
  const [newAttachments, setNewAttachments] = useState([]);
  const [loading,setLoading] = useState(false)
  const [role, setRole] = useState(post.role || "public");
  const [feeling, setFeeling] = useState(post.feeling || "");
  const { user } = useUser();
  const { toast } = useToast();

  const handleConfirm = async () => {
    setLoading(true)
    if (modalType === "edit") {
      const formData = new FormData();
      formData.append("content", editedContent);
      formData.append("role", role);
      formData.append("feeling",feeling)

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
        setLoading(false)
        
      } catch (error) {
        console.error("Error updating post:", error);
        toast({
          title: "Error",
          description: "There was an error updating your post.",
          variant: "error",
          duration: 3000,
        });
        setLoading(false)
      }
    }else if (modalType === "delete") {
      setLoading(true)
        try {
          const updated = await apiService.delete(
            `/posts/${post.id}/`,
            user?.access
          );
          setLoading(false)
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
          setLoading(false)
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
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setModalType("edit")}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType("delete")}>
            Delete
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
            : null
        }
        confirmText={modalType === "edit" ? "Save" : "Delete"}
        onConfirm={handleConfirm}
        loading={loading}
      >
        {modalType === "edit" && (
          <div className="space-y-4">
            {/* Post Content */}
            <div>
              <Label>Post Content</Label>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div>
              <Label>Visibility</Label>
              <Select value={role} onValueChange={(val) => setRole(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="only_me">Only Me</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Feeling</Label>
              <Select value={feeling} onValueChange={(val) => setFeeling(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Feeling" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                                    <SelectItem value="sad">Sad</SelectItem>
                                    <SelectItem value="excited">Excited</SelectItem>
                                    <SelectItem value="tired">Tired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Attachments */}
            <div>
              <Label>Attachments</Label>
              <Input
                type="file"
                multiple
                onChange={handleNewAttachmentChange}
              />

              {/* Existing attachments (images/URLs) */}
              <span className="text-sm mt-2 text-gray-800">Existing Images:</span>
              {/* Existing attachments (URLs) */}
              {existingAttachments.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {existingAttachments.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url.image}
                        alt={`attachment-${index}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full text-xs hidden group-hover:block"
                        onClick={() => removeExistingAttachment(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
      
                {/* Existing attachments (URLs) */}<span className="text-sm mt-2 text-gray-800">New Images:</span>
              {/* New uploads (File previews) */}
              {newAttachments.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {newAttachments.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full text-xs hidden group-hover:block"
                        onClick={() => removeNewAttachment(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </ConfirmModal>
    </>
  );
};

export default PostOptionsDropdown;
