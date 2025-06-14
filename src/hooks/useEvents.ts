import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/UserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useEvents = (filter = "", eventId?: string) => {
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const getToken = () => user?.access || localStorage.getItem("access") || "";

  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events", filter],
    queryFn: async () => {
      const url = filter ? `/events/?filter=${filter}` : "/events/";
      const response = await apiService.get(url, getToken());
      return response.data;
    },
  });

  const { data: interestedEvents = [], isLoading: isLoadingInterestedEvents } = useQuery({
    queryKey: ["interested-events", eventId],
    queryFn: async () => {
      const response = await apiService.get(`/events/${eventId}/interested-users/`, getToken());
      return response.data;
    },
    enabled: !!eventId && !!user?.access,
  });

  const { data: joinedEvents = [], isLoading: isLoadingJoinedEvents } = useQuery({
    queryKey: ["joined-events", eventId],
    queryFn: async () => {
      const response = await apiService.get(`/events/${eventId}/attendees/`, getToken());
      return response.data;
    },
    enabled: !!eventId && !!user?.access,
  });

  const joinMutation = useMutation({
    mutationFn: (id: number) =>
      apiService.post(`/events/${id}/join/`, {}, user?.access),
    onSuccess: (_, id) => {
      toast({
        title: "Joined",
        description: "You joined this event",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["interested-events", id] });
      queryClient.invalidateQueries({ queryKey: ["joined-events", id] });
    },
    onError: () => {
      toast({
        title: "Failed to join event",
        description: "You are already joined this event",
        variant: "error",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (id: number) =>
      apiService.post(`/events/${id}/join/`, {}, user?.access),
    onSuccess: (_, id) => {
      toast({
        title: "Left",
        description: "You left this event",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["interested-events", id] });
      queryClient.invalidateQueries({ queryKey: ["joined-events", id] });
    },
    onError: () => {
      toast({
        title: "Failed to leave event",
        description: "You are not joined this event",
        variant: "error",
      });
    },
  });

  const interestMutation = useMutation({
    mutationFn: (id: number) =>
      apiService.post(`/events/${id}/interested/`, {}, user?.access),
    onSuccess: (_, id) => {
      toast({
        title: "Interest",
        description: "You are interested in this event",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
      queryClient.invalidateQueries({ queryKey: ["interested-events", id] });
      queryClient.invalidateQueries({ queryKey: ["joined-events", id] });
    },
    onError: () => {
      toast({
        title: "Failed to interest event",
        description: "You are already interested in this event",
        variant: "error",
      });
    },
  });   

  const notInterestMutation = useMutation({
    mutationFn: (id: number) =>
      apiService.post(`/events/${id}/interested/`, {}, user?.access),
    onSuccess: (_, id) => {
      toast({
        title: "Not Interest",
        description: "You are not interested in this event",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", id] });
      queryClient.invalidateQueries({ queryKey: ["interested-events", id] });
      queryClient.invalidateQueries({ queryKey: ["joined-events", id] });
    },
    onError: () => {
      toast({
        title: "Failed to not interest event",
        description: "You are not interested in this event",
        variant: "error",
      });
    },
  });

  return {
    events,
    isLoadingEvents,
    leaveMutation,
    joinMutation,
    interestMutation,
    notInterestMutation,
    interestedEvents,
    joinedEvents,
    isLoadingInterestedEvents,
    isLoadingJoinedEvents,
  };
};
