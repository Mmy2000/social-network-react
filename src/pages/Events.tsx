

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import EventOptionsDropdown from "@/components/events/EventOptionsDropdown";
import CreateEventModal from "@/components/events/CreateEventModal";
import { useUser } from "@/context/UserContext";


const EventCard = ({ event }) => {
  const { user } = useUser();
  return (
    <Card className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
      <CardHeader className="relative h-48 p-0">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <EventOptionsDropdown event={event} isCreator={event.creator.id === user?.id} />
      </CardHeader>
      <CardContent className="pt-4">
        <Link to={`/events/${event.id}`}>
          <CardTitle className="text-lg font-semibold mb-2">
            {event.title}
          </CardTitle>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {event.description.length > 100
            ? event.description.slice(0, 100) + "..."
            : event.description}
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          📍 {event.location}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          🕒 {new Date(event.start_time).toLocaleString()} –{" "}
          {new Date(event.end_time).toLocaleTimeString()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <img
              src={event.creator.profile.profile_picture}
              alt={event.creator.profile.full_name}
            />
          </Avatar>
          <Link to={`/profile/${event.creator.id}`}>
            <span className="text-sm">{event.creator.profile.full_name}</span>
          </Link>
        </div>
        <div className="flex items-center flex-col gap-2">
          <span>✅ {event.attendees.length} attending</span>
          <span>⭐ {event.interested_users.length} interested</span>
        </div>
      </CardFooter>
    </Card>
  );
}

const EventGrid = ({ events }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {events?.map((event) => (
      <EventCard key={event.id} event={event} />
    ))}
  </div>
);

const Events = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { events: allEvents, isLoadingEvents: isLoadingAll } = useEvents();
  const { events: upcomingEvents, isLoadingEvents: isLoadingUpcoming } =
    useEvents("interested");
  const { events: myEvents } = useEvents("my");
  const { events: joinedEvents } = useEvents("joined");
  const { events: discoverEvents } = useEvents("discover");
  

  return (
    <div className="container mx-auto py-6 px-4 dark:text-gray-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Create Event
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 dark:bg-gray-800 dark:text-gray-300">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Interested</TabsTrigger>
          <TabsTrigger value="my">My Events</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoadingAll ? (
            <div className="flex justify-center">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <EventGrid events={allEvents} />
          )}
        </TabsContent>

        <TabsContent value="upcoming">
          {isLoadingUpcoming ? (
            <div className="flex justify-center">
              <Loader className="animate-spin" />
            </div>
          ) : (
            <EventGrid events={upcomingEvents} />
          )}
        </TabsContent>

        <TabsContent value="my">
          <EventGrid events={myEvents} />
        </TabsContent>

        <TabsContent value="joined">
          <EventGrid events={joinedEvents} />
        </TabsContent>

        <TabsContent value="discover">
          <EventGrid events={discoverEvents} />
        </TabsContent>
      </Tabs>
      <CreateEventModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Events;
