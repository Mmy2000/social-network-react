import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupOptionsDropdown from "@/components/groups/GroupOptionsDropdown";

const Groups = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useUser();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups", "all"],
    queryFn: () => apiService.get("/groups/", user?.access),
  });

  const { data: myGroups } = useQuery({
    queryKey: ["groups", "my_groups"],
    queryFn: () => apiService.get("/groups/?filter=my_groups", user?.access),
  });

  const { data: createdGroups } = useQuery({
    queryKey: ["groups", "created"],
    queryFn: () => apiService.get("/groups/?filter=created", user?.access),
  });

  const { data: joinedGroups } = useQuery({
    queryKey: ["groups", "joined"],
    queryFn: () => apiService.get("/groups/?filter=joined", user?.access),
  });

  const { data: discoverGroups } = useQuery({
    queryKey: ["groups", "discover"],
    queryFn: () => apiService.get("/groups/?filter=discover", user?.access),
  });
  console.log(groups);

  const GroupCard = ({ group }) => {
    const isAdmin =
      group.members?.some(
        (member) => member.user.id === user?.id && member.role === "admin"
      ) || group.created_by.id === user?.id;

    return (
      <Card className="w-full">
        <CardHeader className="relative h-32 p-0">
          <img
            src={group.cover_image || "/default-group-cover.jpg"}
            alt={group.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <GroupOptionsDropdown group={group} isAdmin={isAdmin} />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-1">{group.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {group.description}
              </CardDescription>
            </div>
            <Avatar className="h-12 w-12">
              <img
                src={group.created_by.profile.profile_picture}
                alt={group.created_by.profile.username}
              />
            </Avatar>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {group.members_count} members
          </div>
          <Link to={`/groups/${group.id}`}>
            <Button variant="outline">View Group</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  const GroupGrid = ({ groups }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups?.data?.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Create Group</Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="my_groups">My Groups</TabsTrigger>
          <TabsTrigger value="created">Created</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <GroupGrid groups={groups} />
        </TabsContent>

        <TabsContent value="my_groups">
          <GroupGrid groups={myGroups} />
        </TabsContent>

        <TabsContent value="created">
          <GroupGrid groups={createdGroups} />
        </TabsContent>

        <TabsContent value="joined">
          <GroupGrid groups={joinedGroups} />
        </TabsContent>

        <TabsContent value="discover">
          <GroupGrid groups={discoverGroups} />
        </TabsContent>
      </Tabs>

      <CreateGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Groups;
