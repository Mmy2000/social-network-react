// import apiService from "@/apiService/apiService";
// import { useToast } from "@/components/ui/use-toast";
// import { useUser } from "@/context/UserContext";
// import { useQuery, useQueryClient } from "@tanstack/react-query";

// export const useEvents = () => {
//     const queryClient = useQueryClient();
//     const { toast } = useToast();
//     const { user } = useUser();

//     const getToken = () => user?.access || localStorage.getItem("access") || "";

//     const { data: events = [], isLoading: isLoadingEvents } = useQuery({
//         queryKey: ["events"],
//         queryFn: async () => {
//             const response = await apiService.get("/events/", getToken());
//             return response.data;
//         },
//     });


//     return {
//         events,
//         isLoadingEvents,

//     }
// }

import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";

export const useEvents = (filter = "") => {
  const { toast } = useToast();
  const { user } = useUser();

  const getToken = () => user?.access || localStorage.getItem("access") || "";

  const { data: events = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ["events", filter],
    queryFn: async () => {
      const url = filter ? `/events/?filter=${filter}` : "/events/";
      const response = await apiService.get(url, getToken());
      return response.data;
    },
  });

  return {
    events,
    isLoadingEvents,
  };
};
