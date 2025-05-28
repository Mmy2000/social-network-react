import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navbar from "./components/layout/Navbar";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { UserProvider } from "./context/UserContext";
import { PostProvider } from "./context/PostContext";
import PostDetails from "./pages/PostDetails";
import { FriendProvider } from "./context/FriendContext";
import Chat from "./pages/Chat";
import ChatDetails from "./pages/ChatDetails";
import ActiveAccount from "./pages/ActiveAccount";

const queryClient = new QueryClient();

const App = () => (
  <UserProvider>
    <FriendProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/post/:id" element={<PostDetails />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:id" element={<ChatDetails />} />
                  <Route path="/activate" element={<ActiveAccount />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </FriendProvider>
  </UserProvider>
);

export default App;
