import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/Spinner";

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

const ActiveAccount = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          otp,
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

  if (!email) {
    navigate("/signup");
    return null;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Activate Your Account
        </h1>
        <p className="text-center text-gray-600">
          Please enter the OTP sent to your email address:
          <br />
          <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input"
              placeholder="Enter OTP"
              required
            />
          </div>

          <button
            type="submit"
            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading && <Spinner />}
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ActiveAccount;
