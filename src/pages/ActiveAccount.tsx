import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const OTP_LENGTH = 4;
const RESEND_TIMEOUT = 30;

const ActiveAccount = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

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

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/resend_code/",
        JSON.stringify({ email })
      );

      if (response?.status_code === 200) {
        toast({
          title: "OTP Resent",
          description: response?.message || "A new OTP has been sent to your email.",
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please try signing up again.",
        variant: "error",
      });
      navigate("/signup");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.postWithoutToken(
        "/accounts/activate/",
        JSON.stringify({
          email,
          otp: otpString,
        })
      );

      if (response?.status_code === 200) {
        toast({
          title: "Success",
          description: "Account activated successfully!",
          variant: "success",
        });
        navigate("/login");
      } else {
        toast({
          title: "Error",
          description: response?.message || "Invalid OTP. Please try again.",
          variant: "error",
        });
        // Clear OTP fields on error
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
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

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-gray-900 dark:text-gray-300">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-gray-800 dark:border-gray-700"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-300">
            Activate Your Account
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please enter the verification code sent to:
            <br />
            <span className="font-medium text-blue-600">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(ref) => (inputRefs.current[index] = ref)}
                onChange={(e) =>
                  handleOtpChange(e.target.value.replace(/[^0-9]/g, ""), index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={cn(
                  "w-12 h-12 text-center text-xl font-bold border rounded-lg",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "transition-all duration-200",
                  activeOtpIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 dark:border-gray-700"
                )}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full h-12 text-base dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
              disabled={loading || otp.some((digit) => !digit)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  Verifying...
                </span>
              ) : (
                "Verify Account"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendOtp}
                disabled={!canResend || loading}
                className="text-sm dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
              >
                {resendTimeout > 0 ? (
                  <span>Resend code in {resendTimeout}s</span>
                ) : (
                  "Resend verification code"
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Didn't receive the code?{" "}
            <Button
              variant="link"
              className="text-blue-600 hover:text-blue-700 p-0 h-auto dark:text-blue-400"
              onClick={() => navigate("/signup")}
            >
              Try signing up again
            </Button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ActiveAccount;
