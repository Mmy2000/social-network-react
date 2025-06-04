import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { Loader, Users, Settings } from "lucide-react";
import GroupOptionsDropdown from "@/components/groups/GroupOptionsDropdown";
import InviteUsersModal from "@/components/groups/InviteUsersModal";

interface GroupResponse {
  data: {
    user_role: string;
    is_member: boolean;
    name: string;
    description: string;
    cover_image: string;
    members_count: number;
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

  const isMember = group?.data?.is_member;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  console.log(group);

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
          <div className="text-center text-gray-500 py-8">
            Discussion feature coming soon...
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members?.data?.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center p-4 bg-white rounded-lg shadow"
              >
                <Avatar className="h-12 w-12">
                  <img
                    src={member.user.profile_pic}
                    alt={member.user.username}
                  />
                </Avatar>
                <div className="ml-4">
                  <h3 className="font-medium">{member.user.username}</h3>
                  <p className="text-sm text-gray-500">
                    {member.role === "admin" ? "Admin" : "Member"}
                  </p>
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
    </div>
  );
};

export default GroupDetails;
