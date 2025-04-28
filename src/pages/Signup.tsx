"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "@/apiService/apiService";
import { useState } from "react";

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
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword1("");
    setPassword2("");
    setFirstName("");
    setLastName("");
    setErrors({});
    setLoading(false);
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address.";
    }

    if (!password1) {
      newErrors.password1 = "Password is required.";
    } else if (password1.length < 6) {
      newErrors.password1 = "Password must be at least 6 characters.";
    }

    if (!password2) {
      newErrors.password2 = "Please confirm your password.";
    } else if (password1 !== password2) {
      newErrors.password2 = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password1":
        setPassword1(value);
        break;
      case "password2":
        setPassword2(value);
        break;
    }
    validateForm();
  };

  const submitSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const formData = {
      email: email,
      password: password1,
      password2: password2,
      first_name: firstName,
      last_name: lastName,
    };

    const response = await apiService.postWithoutToken(
      "/accounts/register/",
      JSON.stringify(formData)
    );
    console.log(response);
    if (response.data.access) {
      // Handle successful signup (e.g., redirect to login page or show success message)
      console.log("Signup successful:", response);
        resetForm();
    } else {
      const tmpErrors: { [key: string]: string } = {};
      Object.entries(response).forEach(([key, value]) => {
        tmpErrors[key] = value[0];
      });
      setErrors(tmpErrors);
    }
    setLoading(false);
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
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="firstName"
              >
                First Name
              </label>
              <input
                onChange={(e) => handleChange("firstName", e.target.value)}
                type="text"
                id="firstName"
                placeholder="First Name"
                autoFocus
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="lastName"
              >
                Last Name
              </label>
              <input
                onChange={(e) => handleChange("lastName", e.target.value)}
                type="text"
                id="lastName"
                placeholder="Last Name"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              onChange={(e) => handleChange("email", e.target.value)}
              type="email"
              id="email"
              placeholder="Email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                onChange={(e) => handleChange("password1", e.target.value)}
                type="password"
                id="password"
                placeholder="Password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {errors.password1 && (
                <p className="text-red-500 text-xs mt-1">{errors.password1}</p>
              )}
            </motion.div>
            <motion.div variants={itemVariants}>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password2"
              >
                Repeat Password
              </label>
              <input
                onChange={(e) => handleChange("password2", e.target.value)}
                type="password"
                id="password2"
                placeholder="Repeat Password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
              {errors.password2 && (
                <p className="text-red-500 text-xs mt-1">{errors.password2}</p>
              )}
            </motion.div>
          </div>

          <motion.button
            onClick={submitSignup}
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg w-full transition duration-300 ease-in-out"
            variants={itemVariants}
          >
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
