"use client";

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/context/UserContext";
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
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Signup = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setUser } = useUser();
  const navigate = useNavigate();

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "firstName":
        if (!value.trim()) error = "First name is required.";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required.";
        break;
      case "email":
        if (!value.trim()) error = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email address.";
        break;
      case "password1":
        if (!value) error = "Password is required.";
        else if (value.length < 6)
          error = "Password must be at least 6 characters.";
        break;
      case "password2":
        if (!value) error = "Please confirm your password.";
        else if (value !== form.password1) error = "Passwords do not match.";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const validateForm = () => {
    const fields = Object.keys(form);
    let valid = true;
    fields.forEach((field) => {
      if (!validateField(field, form[field as keyof typeof form])) {
        valid = false;
      }
    });
    return valid;
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password1: "",
      password2: "",
    });
    setErrors({});
    setLoading(false);
  };

  const submitSignup = async () => {
    if (loading) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiService.postWithoutToken(
        "/accounts/register/",
        JSON.stringify({
          email: form.email,
          password: form.password1,
          password2: form.password2,
          first_name: form.firstName,
          last_name: form.lastName,
        })
      );

      if (response?.data?.access) {
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
          title: "Account Created",
          description: "You have successfully signed up.",
        });
        resetForm();
        // Redirect to the profile page or any other page
        navigate(`/profile/${response.data.user_data.id}`);
      } else {
        toast({
          title: "Signup Failed",
          description: response?.message || "Unexpected error occurred.",
          variant: "destructive",
        });
      }

      // Handle field errors if available
      if (response && typeof response === "object" && !response.data?.access) {
        const tmpErrors: { [key: string]: string } = {};
        Object.entries(response).forEach(([key, value]) => {
          if (Array.isArray(value)) tmpErrors[key] = value[0];
        });
        setErrors(tmpErrors);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Network Error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl font-extrabold text-center text-gray-800"
          variants={itemVariants}
        >
          Create your account
        </motion.h1>

        <motion.form
          onSubmit={(e) => e.preventDefault()}
          variants={containerVariants}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="input"
                placeholder="First Name"
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="input"
                placeholder="Last Name"
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="input"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={form.password1}
                onChange={(e) => handleChange("password1", e.target.value)}
                className="input"
                placeholder="Password"
              />
              {errors.password1 && (
                <p className="text-xs text-red-500 mt-1">{errors.password1}</p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Repeat Password
              </label>
              <input
                type="password"
                value={form.password2}
                onChange={(e) => handleChange("password2", e.target.value)}
                className="input"
                placeholder="Repeat Password"
              />
              {errors.password2 && (
                <p className="text-xs text-red-500 mt-1">{errors.password2}</p>
              )}
            </motion.div>
          </div>

          <motion.button
            type="submit"
            onClick={submitSignup}
            className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            variants={itemVariants}
            disabled={loading}
          >
            {loading && <Spinner  />}
            {loading ? "Creating..." : "Create Account"}
          </motion.button>
        </motion.form>

        <motion.p
          className="text-sm text-center text-gray-600"
          variants={itemVariants}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Login
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;
