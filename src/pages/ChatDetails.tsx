// import { useUser } from '@/context/UserContext';
// import React, { useEffect } from 'react'
// import { useParams } from 'react-router-dom';
// import useWebSocket, { ReadyState } from "react-use-websocket";
// const API_HOST = import.meta.env.VITE_API_WS_HOST as string;


// const ChatDetails = () => {
//   const { user } = useUser();
//   const { id } = useParams<{ id: string }>();
//   console.log(API_HOST);
  

//   const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
//     `${API_HOST}/ws/${id}/?token=${user?.access}`,
//     {
//       share: false,
//       shouldReconnect: () => true,
//     }
//   );

//   useEffect(() => {
//     console.log("Connection state changed", readyState);
//   }, [readyState]);

//   return (
//     <div>ChatDetails</div>
//   )
// }

// export default ChatDetails

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import useWebSocket from "react-use-websocket";
import { Send } from "lucide-react";
import CustomButton from "@/custom/CustomButton";


const API_HOST = import.meta.env.VITE_API_WS_HOST as string;

const ChatDetails: React.FC = () => {
  const { user } = useUser();
  const { id } = useParams(); // conversation id

  const messagesDiv = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      const { event, name, body } = lastJsonMessage as any;

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
          id: "",
          name,
          body,
          // Replace with real user references
          sent_to: {} ,
          created_by: {},
          conversationId: id as string,
        };

        setRealtimeMessages((prev) => [...prev, message]);

        // if (name !== user?.name) {
        //   notifyInfo(`${name} sent you a message`);
        // }

        scrollToBottom();
      }
    }
  }, [lastJsonMessage]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendJsonMessage({
      event: "chat_message",
      data: {
        body: newMessage,
        name: user?.first_name,
        sent_to_id: "TODO", // Add correct user ID
        conversation_id: id,
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

  return (
    <div className=" container mx-auto mt-6">
      <div
        ref={messagesDiv}
        className="max-h-[400px] overflow-auto flex flex-col space-y-3 p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-md"
      >
        {realtimeMessages.map((message, index) => (
          <div
            key={index}
            className={`w-[75%] py-3 px-5 rounded-xl ${
              message.name === user?.first_name
                ? "ml-[25%] bg-blue-100"
                : "bg-gray-100"
            }`}
          >
            <p className="font-semibold text-gray-600">
              {message.name === user?.first_name ? "You" : message.name}
            </p>
            <p className="text-gray-700 text-sm">{message.body}</p>
          </div>
        ))}

        {isTyping && typingUser && (
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm text-gray-500">{typingUser} is typing</p>
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.1s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.2s]" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:.3s]" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 py-3 px-5 bg-white flex border border-gray-300 rounded-lg shadow-md">
        <input
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="p-2 w-[90%] bg-gray-100 rounded-lg focus:outline-none text-gray-700"
        />
        <div className="w-[7%]">
          <CustomButton
            label={
              <div className="flex items-center justify-center space-x-2">
                <Send size={18} />
              </div>
            }
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`ml-4 bg-airbnb text-white font-semibold rounded-lg 
              hover:bg-airbnb-dark active:bg-airbnb-dark transition duration-300 shadow-md 
              ${!newMessage.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatDetails;
