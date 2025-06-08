import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import useWebSocket from "react-use-websocket";
import { Send, Phone, Video, Info, Image as ImageIcon } from "lucide-react";
import CustomButton from "@/custom/CustomButton";
import apiService from "@/apiService/apiService";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/hooks/useChat";
import data from "@emoji-mart/data";
import PickerComponent from "@emoji-mart/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  profile_picture?: string;
  full_name?: string;
}

interface User {
  id: number;
  first_name: string;
  profile?: UserProfile;
  is_online?: boolean;
}

interface Message {
  id: number | string;
  name: string;
  body: string;
  sent_to: User;
  created_by: User;
  conversationId: string;
  timestamp?: string;
}

const API_HOST = import.meta.env.VITE_API_WS_HOST as string;

const ChatDetails: React.FC = () => {
  const { user } = useUser();
  const { id } = useParams(); // conversation id

  const messagesDiv = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [previousMessages, setPreviousMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { markMessagesAsRead } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addEmoji = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
  };

  // Mark messages as read when the chat is opened
  useEffect(() => {
    if (id) {
      markMessagesAsRead(id);
    }
  }, [id, markMessagesAsRead]);

  // Mark messages as read when scrolling to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (messagesDiv.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesDiv.current;
        if (scrollHeight - scrollTop - clientHeight < 50) {
          markMessagesAsRead(id as string);
        }
      }
    };

    const messagesDivElement = messagesDiv.current;
    if (messagesDivElement) {
      messagesDivElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (messagesDivElement) {
        messagesDivElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [id, markMessagesAsRead]);

  useEffect(() => {
    const fetchConversationDetails = async () => {
      try {
        const response = await apiService.get(
          `/chat/conversations/${id}`,
          user?.access
        );
        console.log(response);

        const otherParticipant = response.data.conversation.users.find(
          (u) => u.id !== user?.id
        );
        setOtherUser(otherParticipant);

        const formattedMessages = response?.data?.messages?.map((msg) => ({
          id: msg.id,
          name: msg.created_by.first_name,
          body: msg.body,
          sent_to: msg.sent_to,
          created_by: msg.created_by,
          conversationId: id,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
        }));

        setPreviousMessages(formattedMessages);
        setIsLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error fetching conversation details:", error);
        setIsLoading(false);
      }
    };

    if (id) {
      fetchConversationDetails();
    }
  }, [id, user?.id]);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${API_HOST}/ws/${id}/?token=${user?.access}`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (
      lastJsonMessage &&
      typeof lastJsonMessage === "object" &&
      "event" in lastJsonMessage
    ) {
      const { event, name, body, created_by, sent_to } = lastJsonMessage as any;

      if (event === "typing") {
        if (name !== user?.first_name) {
          setTypingUser(name);
          setIsTyping(true);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
            setIsTyping(false);
          }, 3000);
        }
      }

      if (event === "chat_message") {
        const message = {
          id: Date.now(), // temporary id for the message
          name,
          body,
          sent_to: sent_to || otherUser,
          created_by: created_by || {
            id: name === user?.first_name ? user?.id : otherUser?.id,
            first_name: name,
            profile: {
              profile_picture:
                name === user?.first_name
                  ? user?.profile_pic
                  : otherUser?.profile?.profile_picture,
            },
          },
          conversationId: id as string,
          timestamp: new Date().toLocaleTimeString(),
        };

        setRealtimeMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
    }
  }, [
    lastJsonMessage,
    user?.first_name,
    user?.id,
    user?.profile_pic,
    otherUser,
    id,
  ]);

  const sendMessage = () => {
    if (!newMessage.trim() || !otherUser) return;
    setShowEmojiPicker(false);
    sendJsonMessage({
      event: "chat_message",
      data: {
        body: newMessage,
        name: user?.first_name,
        sent_to_id: otherUser.id,
        conversation_id: id,
        created_by: {
          id: user?.id,
          first_name: user?.first_name,
          profile: {
            profile_picture: user?.profile_pic,
          },
        },
        sent_to: otherUser,
      },
    });

    setNewMessage("");
    setTimeout(scrollToBottom, 50);
  };

  const scrollToBottom = () => {
    if (messagesDiv.current) {
      messagesDiv.current.scrollTop = messagesDiv.current.scrollHeight;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    sendJsonMessage({
      event: "typing",
      data: {
        name: user?.first_name,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newMessage.trim()) {
      sendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClick = (e: MouseEvent) => {
      // Close if click is outside the emoji picker and emoji button
      if (
        !document.getElementById("emoji-picker")?.contains(e.target as Node) &&
        !document.getElementById("emoji-btn")?.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showEmojiPicker]);


  return (
    <div className="lg:mx-60 mx-10 h-[calc(100vh-10rem)]">
      <div className="flex justify-center items-center my-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">This service will be available soon</h1>
          <p className="text-sm text-gray-500">it works on local machine only, because of the websocket connection is not working on the free hosting server i should buy a domain and a server to make it work</p>
        </div>
      </div>
      {/* Chat Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <img
              src={otherUser?.profile?.profile_picture}
              alt={otherUser?.first_name}
              className="object-cover"
            />
          </Avatar>
          <div>
            <Link
              to={`/profile/${otherUser?.id}`}
              className="font-semibold text-lg hover:underline"
            >
              {otherUser?.profile?.full_name || otherUser?.first_name}
            </Link>
            <p className="text-sm text-gray-500">
              {otherUser?.is_online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Phone className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Video className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Info className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-12rem)]">
        {/* Chat Messages */}
        <div className="flex flex-col ">
          <div
            ref={messagesDiv}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
          >
            {previousMessages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mb-2">
                No previous messages
              </div>
            )}
            {previousMessages.map((message, index) => (
              <div
                key={`prev-${message.id}-${index}`}
                className={`flex items-end gap-2 ${
                  message.name === user?.first_name
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.name !== user?.first_name && (
                  <Avatar className="h-8 w-8">
                    <img
                      src={message.created_by?.profile?.profile_picture}
                      alt={message.name}
                      className="object-cover"
                    />
                  </Avatar>
                )}
                <div
                  className={`max-w-[65%] ${
                    message.name === user?.first_name
                      ? "bg-facebook text-white"
                      : "bg-gray-100 text-gray-900"
                  } rounded-2xl px-4 py-2`}
                >
                  <p className="text-sm">{message.body}</p>
                  <span className="text-[10px] mt-1 block opacity-70">
                    {message.timestamp}
                  </span>
                </div>
                {message.name === user?.first_name && (
                  <Avatar className="h-8 w-8">
                    <img
                      src={message.created_by?.profile?.profile_picture}
                      alt={message.name}
                      className="object-cover"
                    />
                  </Avatar>
                )}
              </div>
            ))}

            {realtimeMessages.map((message, index) => (
              <div
                key={`real-${index}`}
                className={`flex items-end gap-2 ${
                  message.name === user?.first_name
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.name !== user?.first_name && (
                  <Avatar className="h-8 w-8">
                    <img
                      src={message.created_by?.profile?.profile_picture}
                      alt={message.name}
                      className="object-cover"
                    />
                  </Avatar>
                )}
                <div
                  className={`max-w-[65%] ${
                    message.name === user?.first_name
                      ? "bg-facebook text-white"
                      : "bg-gray-100 text-gray-900"
                  } rounded-2xl px-4 py-2`}
                >
                  <p className="text-sm">{message.body}</p>
                  <span className="text-[10px] mt-1 block opacity-70">
                    {message.timestamp}
                  </span>
                </div>
                {message.name === user?.first_name && (
                  <Avatar className="h-8 w-8">
                    <img
                      src={message.created_by?.profile?.profile_picture}
                      alt={message.name}
                      className="object-cover"
                    />
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && typingUser && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Avatar className="h-8 w-8">
                  <img
                    src={otherUser?.profile?.profile_picture}
                    alt={typingUser}
                    className="object-cover"
                  />
                </Avatar>
                <div className="bg-gray-100 rounded-full px-4 py-2">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      {/* Chat Input */}
      <div className="p-4 border-t bg-white sticky bottom-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ImageIcon className="h-5 w-5 text-gray-600" />
          </Button>
          <Button
            id="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-full z-10"
          >
            😊
          </Button>

          <div className="relative flex-1">
            {showEmojiPicker && (
              <div id="emoji-picker" className="absolute bottom-12 left-0 z-50">
                <PickerComponent data={data} onEmojiSelect={addEmoji} />
              </div>
            )}
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-facebook focus:bg-white transition-colors"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`rounded-full bg-facebook hover:bg-facebook-dark transition-colors ${
              !newMessage.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
