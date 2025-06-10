import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { Loader, Users, Settings, Trash } from "lucide-react";
import GroupOptionsDropdown from "@/components/groups/GroupOptionsDropdown";
import InviteUsersModal from "@/components/groups/InviteUsersModal";
import CreatePostCard from "@/components/feed/CreatePostCard";
import Feed from "@/components/feed/Feed";
import ConfirmModal from "@/components/modal/ConfirmModal";

interface GroupResponse {
  data: {
    user_role: string;
    is_member: boolean;
    name: string;
    description: string;
    cover_image: string;
    members_count: number;
    is_private: boolean;
  };
}

const GroupDetails = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const { data: group, isLoading }: UseQueryResult<GroupResponse> = useQuery({
    queryKey: ["group", id],
    queryFn: () => apiService.get(`/groups/${id}/`, user?.access),
    enabled: !!id && !!user?.access,
  });

  useEffect(() => {
    if (group?.data) {
      setUserRole(group.data.user_role);
      setIsAdmin(group.data.user_role === "admin");
    }
  }, [group?.data]);

  const { data: members } = useQuery({
    queryKey: ["group-members", id],
    queryFn: () => apiService.get(`/groups/${id}/members/`, user?.access),
    enabled: !!id && !!user?.access,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiService.post(`/groups/${id}/join/`, {}, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Success",
        description: "Successfully joined the group",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to join group",
        variant: "error",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await apiService.delete(`/groups/${id}/leave/`, user?.access);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Success",
        description: "Successfully left the group",
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to leave group",
        variant: "error",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      return await apiService.delete(
        `/groups/${id}/remove-member/${memberId}/`,
        user?.access
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Success",
        description: "Successfully removed member from group",
        variant: "success",
      });
      setIsRemoveMemberModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove member from group",
        variant: "error",
      });
    },
  });

  const isMember = group?.data?.is_member;

  const handleNewPost = () => {
    // Invalidate and refetch posts query
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Group Header */}
      <div className="relative">
        <div className="h-64 w-full rounded-lg overflow-hidden">
          <img
            src={group?.data?.cover_image || "/default-group-cover.jpg"}
            alt={group?.data?.name}
            className="w-full h-full object-cover"
          />
        </div>
        {isAdmin && (
          <div className="absolute top-4 right-4">
            <GroupOptionsDropdown group={group?.data} isAdmin={isAdmin} />
          </div>
        )}
      </div>

      {/* Group Info */}
      <div className="mt-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{group?.data?.name}</h1>
          <p className="text-gray-600 mt-2">{group?.data?.description}</p>
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            {group?.data?.members_count} members
          </div>
        </div>
        <div className="space-x-2">
          {!isMember ? (
            <Button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Join Group
            </Button>
          ) : (
            <>
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Leave Group
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Group Content */}
      <Tabs defaultValue="discussion" className="mt-8">
        <TabsList>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="discussion" className="mt-4">
          {/* Add your discussion/posts component here */}
          {group?.data?.is_private && !isMember ? (
            <div className="flex items-center justify-center">
              <h1>You are not a member of this group</h1>
            </div>
          ) : (
            <div className="">
              <Feed groupId={id} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {members?.data?.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center p-4 bg-white rounded-lg shadow"
              >
                <Avatar className="h-12 w-12">
                  <img
                    src={member.user.profile.profile_picture}
                    alt={member.user.profile.full_name}
                  />
                </Avatar>
                <div className="ml-4 flex items-center justify-between w-full">
                  <div>
                    <Link to={`/profile/${member.user.id}`}>
                      <h3 className="font-medium">
                        {member.user.profile.full_name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">
                      {member.role === "admin" ? "Admin" : "Member"}
                    </p>
                  </div>
                  {isAdmin && member.user.id !== user?.id && (
                    <Button
                      onClick={() => {
                        setSelectedMemberId(member.user.id);
                        setIsRemoveMemberModalOpen(true);
                      }}
                      variant="destructive"
                      size="icon"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="settings" className="mt-4">
            {/* Add your settings component here */}
            <div className="text-center text-gray-500 py-8">
              Settings feature coming soon...
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Invite Members Modal */}
      <InviteUsersModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={id}
      />

      <ConfirmModal
        open={isRemoveMemberModalOpen}
        onClose={() => setIsRemoveMemberModalOpen(false)}
        onConfirm={() => removeMemberMutation.mutate(selectedMemberId)}
        title="Remove Member"
        content="Are you sure you want to remove this member from the group?"
        loading={removeMemberMutation.isPending}
        confirmText="Remove"
      />
    </div>
  );
};

export default GroupDetails;
