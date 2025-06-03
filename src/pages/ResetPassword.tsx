import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Mail, KeyRound } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 10,
    },
  },
};

const steps = [
  { id: 1, title: "Email Verification", icon: Mail },
  { id: 2, title: "Reset Password", icon: KeyRound },
];

const OTP_LENGTH = 4;
const RESEND_TIMEOUT = 30;

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimeout > 0) {
      interval = setInterval(() => {
        setResendTimeout((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimeout]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveOtpIndex(index + 1);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // Move to previous input on backspace if current input is empty
        inputRefs.current[index - 1]?.focus();
        setActiveOtpIndex(index - 1);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedOtp = pastedData.slice(0, OTP_LENGTH).split("");

    if (pastedOtp.length) {
      const newOtp = [...otp];
      pastedOtp.forEach((value, index) => {
        if (index < OTP_LENGTH) {
          newOtp[index] = value;
        }
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedOtp.length, OTP_LENGTH - 1)]?.focus();
    }
  };

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
          description: response?.message || "OTP has been sent to your email",
          variant: "success",
        });
        setStep(2);
        setResendTimeout(RESEND_TIMEOUT);
        setCanResend(false);
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

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/forget-password/",
        JSON.stringify({ email })
      );

      if (response.status_code === 200) {
        toast({
          title: "OTP Resent",
          description:
            response?.message || "A new OTP has been sent to your email.",
          variant: "success",
        });
        setResendTimeout(RESEND_TIMEOUT);
        setCanResend(false);
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to resend OTP.",
          variant: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== OTP_LENGTH) {
      toast({
        title: "Invalid OTP",
        description: `Please enter all ${OTP_LENGTH} digits.`,
        variant: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/reset_password/",
        JSON.stringify({
          email,
          otp: otpString,
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
      } else {
        toast({
          title: "Error",
          description:
            response?.message || "Failed to reset password. Please try again.",
          variant: "error",
        });
        // Clear OTP fields on error
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="w-full max-w-md space-y-8 bg-white rounded-2xl shadow-xl p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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

          <AnimatePresence mode="wait">
            {step === 1 && (
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Sending...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </motion.form>
            )}
            {step === 2 && (
              <motion.form
                onSubmit={handleResetPassword}
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter Verification Code
                    </label>
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={digit}
                          ref={(ref) => (inputRefs.current[index] = ref)}
                          onChange={(e) =>
                            handleOtpChange(
                              e.target.value.replace(/[^0-9]/g, ""),
                              index
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={handlePaste}
                          className={cn(
                            "w-12 h-12 text-center text-xl font-bold rounded-lg outline-none",
                            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            "transition-all duration-200",
                            "border border-gray-200",
                            activeOtpIndex === index
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          )}
                          aria-label={`Digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    <div className="text-center mt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendOtp}
                        disabled={!canResend || loading}
                        className="text-sm"
                      >
                        {resendTimeout > 0 ? (
                          <span>Resend code in {resendTimeout}s</span>
                        ) : (
                          "Resend verification code"
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  disabled={
                    loading || otp.some((digit) => !digit) || !newPassword
                  }
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
