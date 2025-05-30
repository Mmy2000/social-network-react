import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user } = useUser();

  // If user is authenticated, redirect to their profile page
  if (user) {
    return <Navigate to={`/profile/${user.id}`} replace />;
  }

  // If user is not authenticated, render the children (login/signup page)
  return <>{children}</>;
};

export default AuthRoute;
