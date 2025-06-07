"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import apiService from "@/apiService/apiService";
import { useUser } from "@/context/UserContext";
import { Spinner } from "../ui/Spinner";

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (formData.new_password !== formData.confirm_password) {
      toast({
        title: "Error",
        description: "New password and confirm password do not match.",
        variant: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.post(
        "/accounts/change_password/", // Update to your actual API endpoint
        formData,
        user?.access
      );      

      toast({
        title: "Success",
        description: response?.message || "Password changed successfully",
        variant: "success",
      });

      // Clear form
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to change password",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Current Password"
              value={formData.current_password}
              onChange={(e) =>
                setFormData({ ...formData, current_password: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="New Password"
              value={formData.new_password}
              onChange={(e) =>
                setFormData({ ...formData, new_password: e.target.value })
              }
              required
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              required
            />
          </div>
          <Button type="submit" className={`w-full ${loading? "cursor-not-allowed" : ""}`} disabled={loading}>
            {loading && (
              <div className="flex items-center justify-center">
                <Spinner />
              </div>
            )}
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;