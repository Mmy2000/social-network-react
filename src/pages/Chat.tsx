import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import axios from "axios";
const API_HOST = import.meta.env.VITE_API_HOST as string;
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const Chat = () => {
    const { user } = useUser();
  const [conversations, setConversations] = useState(null);
  const [loading, setLoading] = useState(true);

  let headers = {
    token: localStorage.getItem("user"),
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await apiService.get(`/chat/conversations/`,user?.access);
        console.log(res);
        
        setConversations(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);
  console.log(conversations?.users);
  

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 bg-slate-300 w-1/2" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
        <Skeleton className="h-24 bg-slate-200 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Conversations</h2>

      {conversations.map((conv, index) => {
        const otherUser = conv.users.find((u) => u.id !== user?.id);
        const imageUrl =
          otherUser?.profile?.profile_picture || "/default-avatar.png";

        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/chat/${conv?.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={imageUrl} alt={otherUser?.username} />
                    <AvatarFallback>
                      {otherUser?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {otherUser?.profile?.full_name || otherUser?.username}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(conv.modified_at).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Chat;
