import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Users, Trash, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { Avatar } from "@/components/ui/avatar";
import ConfirmModal from "@/components/modal/ConfirmModal";
import { useEvents } from "@/hooks/useEvents";
import { Link } from "react-router-dom";
import Feed from "@/components/feed/Feed";

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    leaveMutation,
    joinMutation,
    interestMutation,
    notInterestMutation,
    interestedEvents,
    joinedEvents,
    isLoadingInterestedEvents,
    isLoadingJoinedEvents,
  } = useEvents("", id);

  const [isCreator, setIsCreator] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => apiService.get(`/events/${id}/`, user?.access),
    enabled: !!id && !!user?.access,
  });

  const { data: attendees } = useQuery({
    queryKey: ["event-attendees", id],
    queryFn: () => apiService.get(`/events/${id}/attendees/`, user?.access),
    enabled: !!id && !!user?.access,
  });

  useEffect(() => {
    if (event?.data) {
      setIsCreator(user?.id === event.data.creator.id);
      setIsAttending(event.data.is_joined);
      setIsInterested(event.data.is_interested);
    }
  }, [event, user]);

  const handleJoin = () => {
    joinMutation.mutate(Number(id), {
      onSuccess: () => {
        setIsAttending(true);
      },
    });
  };

  const handleLeave = () => {
    leaveMutation.mutate(Number(id), {
      onSuccess: () => {
        setIsAttending(false);
      },
    });
  };

  const handleInterest = () => {
    interestMutation.mutate(Number(id), {
      onSuccess: () => {
        setIsInterested(true);
      },
    });
  };

  const handleNotInterest = () => {
    notInterestMutation.mutate(Number(id), {
      onSuccess: () => {
        setIsInterested(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }  

  return (
    <div className="container mx-auto py-6 px-4 dark:text-gray-300">
      {/* Event Header */}
      <div className="relative">
        <div className="h-64 w-full rounded-lg overflow-hidden">
          <img
            src={event?.data?.image || "/default-event-cover.jpg"}
            alt={event?.data?.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Event Info */}
      <div className="mt-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{event?.data?.title}</h1>
          <p className="text-gray-600 mt-2 dark:text-gray-400">
            {event?.data?.description}
          </p>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            📍 {event?.data?.location} <br />
            🕒 {new Date(event?.data?.start_time).toLocaleString()} -{" "}
            {new Date(event?.data?.end_time).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="space-x-2">
            {!isAttending ? (
              <Button onClick={handleJoin} disabled={joinMutation.isPending}>
                {joinMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Join Event
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleLeave}
                disabled={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Leave Event
              </Button>
            )}
          </div>
          <div className="space-x-2">
            {isInterested ? (
              <Button
                onClick={handleNotInterest}
                variant="destructive"
                className="dark:border-gray-600"
              >
                <Star className="h-4 w-4" />
                {notInterestMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Not Interest
              </Button>
            ) : (
              <Button
                onClick={handleInterest}
                variant="outline"
                className="dark:border-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Star className="h-4 w-4" />
                {interestMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Interest
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Event Tabs */}
      <Tabs defaultValue="details" className="mt-8">
        <TabsList className="dark:bg-gray-900 dark:text-gray-300">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="attendees">Attendees</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          {isCreator && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="details" className="mt-4">
          {/* Event description / posts / discussion */}
          <div className="dark:text-gray-400">
            {/* Replace with comment/feed if available */}
            <Feed eventId={id} />
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {joinedEvents?.map((attendee) => (
              <div
                key={attendee?.user?.id}
                className="flex items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-300"
              >
                <Avatar className="h-12 w-12">
                  <img
                    src={attendee?.profile?.profile_picture}
                    alt={attendee?.profile?.full_name}
                  />
                </Avatar>
                <div className="ml-4 flex items-center justify-between w-full">
                  <div>
                    <Link to={`/profile/${attendee?.id}`}>
                      <h3 className="font-medium">
                        {attendee?.profile?.full_name}
                      </h3>
                    </Link>
                  </div>
                  {isCreator && attendee?.id === user?.id && (
                    <h3 className="text-gray-500">Owner</h3>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="interested" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {interestedEvents?.map((attendee) => (
              <div
                key={attendee?.id}
                className="flex items-center p-4 bg-white rounded-lg shadow dark:bg-gray-800 dark:text-gray-300"
              >
                <Avatar className="h-12 w-12">
                  <img
                    src={attendee?.profile?.profile_picture}
                    alt={attendee?.profile?.full_name}
                  />
                </Avatar>
                <div className="ml-4 flex items-center justify-between w-full">
                  <div>
                    <Link to={`/profile/${attendee?.id}`}>
                      <h3 className="font-medium">
                        {attendee?.profile?.full_name}
                      </h3>
                    </Link>
                  </div>
                  {isCreator && attendee?.id === user?.id && (
                    <h3 className="text-gray-500">Owner</h3>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {isCreator && (
          <TabsContent value="settings" className="mt-4">
            <div className="text-center text-gray-500 py-8 dark:text-gray-400">
              Settings section for the event coming soon...
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default EventDetails;
