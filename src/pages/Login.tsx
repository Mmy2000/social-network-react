import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/UserContext";
import apiService from "@/apiService/apiService";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 10,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Login = () => {
  const [emailorusername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const submitLogin = async () => {
    setLoading(true);
    const formData = {
      email_or_username: emailorusername,
      password: password,
    };
    const response = await apiService.postWithoutToken(
      "/accounts/login/",
      JSON.stringify(formData)
    );
    console.log(response);
    if (response.data.access) {
      console.log("Login successful:", response.data);
      
      setUser({
        id: response.data.user_data.id,
        first_name: response.data.user_data.first_name,
        last_name: response.data.user_data.last_name,
        email: response.data.user_data.email,
        username: response.data.user_data.username,
        profile_pic: response.data.user_data.profile.profile_picture,
        isActive: response.data.user_data.is_active,
        access: response.data.access,
        refresh: response.data.refresh,
      });
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      });
      setLoading(false);
      const tmpErrors: { [key: string]: string } = {};
      Object.entries(response).forEach(([key, value]) => {
        tmpErrors[key] = value[0];
      });
      setErrors(tmpErrors);
    } else {
      // Handle unexpected response
      console.log("Unexpected response:", response.message);
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
    setLoading(false);
    
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl font-extrabold text-center text-gray-800"
          variants={itemVariants}
        >
          Welcome Back
        </motion.h2>

        <motion.form
          onSubmit={(e) => e.preventDefault()}
          variants={containerVariants}
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <label
              htmlFor="emailorusername"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              onChange={(e) => setEmailOrUsername(e.target.value)}
              type="text"
              id="emailorusername"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="Enter your email or username"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              placeholder="Enter your password"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            onClick={submitLogin}
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            variants={itemVariants}
          >
            Login
          </motion.button>
        </motion.form>

        <motion.p
          className="text-sm text-center text-gray-600"
          variants={itemVariants}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign Up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
