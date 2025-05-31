import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const useChat = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const startConversation = async (userId: number) => {
    try {
      const response = await apiService.get(
        `/chat/conversations/start/${userId}/`,
        user?.access
      );
      
      if (response?.data?.conversation_id) {
        navigate(`/chat/${response.data.conversation_id}`);
      } else {
        toast({
          title: "Error",
          description: "Could not start conversation. Please try again.",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Could not start conversation. Please try again.",
        variant: "error",
      });
    }
  };

  return {
    startConversation,
  };
}; 