import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import ChangePasswordForm from "./ChangePasswordForm";

export const Settings = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto py-10 dark:text-gray-300">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-4">
          <TabsList className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-800">
            <TabsTrigger
              className="dark:data-[state=active]:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-700"
              value="account"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              className="dark:data-[state=active]:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-700"
              value="security"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              className="dark:data-[state=active]:text-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-700"
              value="notifications"
            >
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            {/* Add account settings components here */}
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <ChangePasswordForm />
            {/* Add other security settings components here */}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {/* Add notification settings components here */}
            <p className="text-sm text-muted-foreground">
              Manage your notification preferences
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
