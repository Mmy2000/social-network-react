import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import ConfirmModal from "../modal/ConfirmModal";
import UpdateGroupModal from "./UpdateGroupModal";
import { useNavigate } from "react-router-dom";

interface GroupOptionsDropdownProps {
  group: any;
  isAdmin: boolean;
}

const GroupOptionsDropdown: React.FC<GroupOptionsDropdownProps> = ({
  group,
  isAdmin,
}) => {
  const [modalType, setModalType] = useState<"delete" | "edit" | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      return await apiService.delete(`/groups/${group.id}/`, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
        variant: "success",
      });
      setModalType(null);
      navigate("/groups");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete group",
        variant: "error",
      });
    },
  });

  const handleDelete = async () => {
    deleteGroupMutation.mutate();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setModalType("edit")}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setModalType("delete")}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete group
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600">
            <Flag className="h-4 w-4 mr-2" />
            Report group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={modalType === "delete"}
        onClose={() => setModalType(null)}
        title="Delete Group"
        content="Are you sure you want to delete this group? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteGroupMutation.isPending}
      />

      {/* Edit Group Modal */}
      {modalType === "edit" && (
        <UpdateGroupModal
          group={group}
          open={true}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
};

export default GroupOptionsDropdown;
