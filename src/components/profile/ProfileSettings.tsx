import React, { useState } from "react";
import apiService from "@/apiService/apiService";
import { Input } from "../ui/input";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/Spinner";
import { motion } from "framer-motion";

const ProfileSettings = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);

    try {
      const response = await apiService.post(
        "/accounts/change_password/", // Update to your actual API endpoint
        formData,
        user?.access
      );
      toast({
        title: "Password changed successfully",
        description: response?.message,
        variant: "success",
      });
  
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      const errorMsg =
        error.message ||
        "An error occurred while changing the password.";
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (

    <motion.div className="bg-white  rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div>
          <label className="block mb-1 font-medium">Current Password</label>
          <Input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            required
          />
        </motion.div>
        <motion.div>
          <label className="block mb-1 font-medium">New Password</label>
          <Input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
          />
        </motion.div>
        <motion.div>
          <label className="block mb-1 font-medium">Confirm New Password</label>
          <Input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </motion.div>
        <motion.button
          type="submit"
          className=" flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          disabled={loading}
        >
          {loading && (
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          )}
          {loading ? "Changing..." : "Change Password"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProfileSettings;
