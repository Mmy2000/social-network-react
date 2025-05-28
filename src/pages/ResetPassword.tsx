import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle2, Mail, KeyRound } from "lucide-react";

const steps = [
  { id: 1, title: "Email Verification", icon: Mail },
  { id: 2, title: "Reset Password", icon: KeyRound },
];

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/forget-password/",
        JSON.stringify({ email })
      );
      if (response.status_code === 200) {
        toast({
          title: "Success",
          description: "OTP has been sent to your email",
          variant: "success",
        });
        setStep(2);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please check your email.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/reset_password/",
        JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        })
      );
      if (response.status_code === 200) {
        toast({
          title: "Success",
          description: "Password has been reset successfully",
          variant: "success",
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full max-w-md space-y-8 bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            Reset Password
          </h1>

          {/* Stepper */}
          <div className="relative mb-12">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200" />
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-500 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {steps.map((s, i) => {
                const StepIcon = s.icon;
                return (
                  <div
                    key={s.id}
                    className={`flex flex-col items-center ${
                      i === steps.length - 1
                        ? "items-end"
                        : i === 0
                        ? "items-start"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                        step >= s.id
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 bg-white text-gray-300"
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        step >= s.id ? "text-blue-500" : "text-gray-500"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {step === 1 ? (
            <motion.form
              onSubmit={handleRequestOTP}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading && <Spinner />}
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </motion.form>
          ) : (
            <motion.form
              onSubmit={handleResetPassword}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter OTP from email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading && <Spinner />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
