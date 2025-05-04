import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext } from "react";
import { useUser } from "./UserContext";
import apiService from "@/apiService/apiService";

const FriendContext = createContext<any>(null);

export const FriendProvider = ({ children }) => {
    const { toast } = useToast();
    const { user } = useUser();
    const [loading, setLoading] = React.useState(false);

    const sendFriendRequest = async (userId) => {
      setLoading(true);
      try {
        const token = user?.access || localStorage.getItem("access") || "";
        const res = await apiService.post(
          `/accounts/friend-request/send/`,
          { created_for: userId }, // send user ID in body
          token
        );
        toast({ title: "Friend request sent!", variant: "success" });
      } catch (error) {
        toast({
          title: "Error",
          description: error?.message,
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <FriendContext.Provider
        value={{
          sendFriendRequest,
          loading,
        }}
      >
        {children}
      </FriendContext.Provider>
    );


}


export const useFriend = () => useContext(FriendContext);
