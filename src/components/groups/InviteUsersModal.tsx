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
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { Loader, Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InviteUsersModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
}

const InviteUsersModal: React.FC<InviteUsersModalProps> = ({
  open,
  onClose,
  groupId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  // Search users
  React.useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await apiService.get(
          `/accounts/search/?q=${debouncedSearch}`,
          user?.access
        );        
        // Filter out already selected users
        const filteredResults = response.data.filter(
          (searchUser: any) =>
            !selectedUsers.some((selected) => selected.id === searchUser.id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, user?.access, selectedUsers]);

  const inviteMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      return await apiService.post(
        `/groups/${groupId}/invite/`,
        { user_ids: userIds },
        user?.access
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      toast({
        title: "Success",
        description: "Invitations sent successfully",
        variant: "success",
      });
      onClose();
      setSelectedUsers([]);
      setSearchTerm("");
    },
    onError: (error: any) => {
      console.log(error);
      
      toast({
        title: "Error",
        description: error?.data?.user_ids || "Failed to send invitations",
        variant: "error",
      });
    },
  });

  const handleInvite = () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user to invite",
        variant: "error",
      });
      return;
    }

    inviteMutation.mutate(selectedUsers.map((user) => user.id));
  };

  const handleSelectUser = (user: any) => {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((result) => result.id !== user.id));
    setSearchTerm("");
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.filter((selected) => selected.id !== userId)
    );
  };
  console.log(searchResults);
  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Search and select users to invite to your group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((selectedUser) => (
                <div
                  key={selectedUser.id}
                  className="flex items-center bg-gray-100 rounded-full pl-2 pr-1 py-1"
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <img
                      src={selectedUser.profile.profile_picture}
                      alt={selectedUser.profile.username}
                    />
                  </Avatar>
                  <span className="text-sm">{selectedUser.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-1 hover:bg-gray-200"
                    onClick={() => handleRemoveUser(selectedUser.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Search Results */}
          {isSearching ? (
            <div className="flex justify-center py-4">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => handleSelectUser(searchUser)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <img
                          src={searchUser.profile.profile_picture}
                          alt={searchUser.profile.full_name}
                        />
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {searchUser.profile.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {searchUser.username}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : searchTerm && !isSearching ? (
            <div className="text-center py-4 text-gray-500">No users found</div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedUsers.length === 0 || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Send Invitations
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteUsersModal;
