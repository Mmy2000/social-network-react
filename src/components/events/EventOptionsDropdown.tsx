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
import { useNavigate } from "react-router-dom";
import UpdateEventModal from "./UpdateEventModal";

interface EventOptionsDropdownProps {
  event: any;
  isCreator: boolean;
}

const EventOptionsDropdown: React.FC<EventOptionsDropdownProps> = ({
  event,
  isCreator,
}) => {
  const [modalType, setModalType] = useState<"delete" | "edit" | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return await apiService.delete(`/events/${event.id}/`, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete event",
      });
    },
  });

  const handleDelete = async () => {
    deleteEventMutation.mutate();
  };

  if (!isCreator) {
    return null;
  }  

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
        >
          <DropdownMenuItem
            onClick={() => setModalType("edit")}
            className="dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700 dark:text-gray-300"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit group
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setModalType("delete")}
            className="text-red-600 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700 dark:text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete group
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 dark:hover:bg-gray-700 dark:data-[state=active]:bg-gray-700 dark:text-red-500">
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
      />
      {modalType === "edit" && (
        <UpdateEventModal
          event={event}
          open={true}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
};

export default EventOptionsDropdown;
