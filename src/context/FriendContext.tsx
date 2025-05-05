import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext } from "react";
import { useUser } from "./UserContext";
import apiService from "@/apiService/apiService";

const FriendContext = createContext<any>(null);

export const FriendProvider = ({ children }) => {
    const { toast } = useToast();
    const { user } = useUser();
    const [loadingBtn, setLoadingBtn] = React.useState(false);

    const sendFriendRequest = async (userId) => {
      setLoadingBtn(true);
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
        setLoadingBtn(false);
      }
    };

    return (
      <FriendContext.Provider
        value={{
          sendFriendRequest,
          loadingBtn,
        }}
      >
        {children}
      </FriendContext.Provider>
    );


}


export const useFriend = () => useContext(FriendContext);
