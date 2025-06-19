import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NotFound = () => {
  // Animation variants for better structure
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.2, // Add a stagger for child elements
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.42, 0, 0.58, 1] },
    },
  };

  const buttonHover = {
    hover: { scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center my-6 text-gray-800 dark:text-facebook-dark"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated 404 */}
      <motion.div className="flex items-center space-x-2">
        <motion.h1
          className="text-9xl font-extrabold tracking-widest"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            textShadow: "4px 4px 12px rgba(0, 0, 0, 0.3)",
          }}
          transition={{ duration: 1.2, ease: [0.42, 0, 0.58, 1] }}
        >
          404
        </motion.h1>
      </motion.div>

      {/* Animated Message */}
      <motion.p
        className="mt-6 text-xl text-center px-6 max-w-lg font-light leading-relaxed dark:text-facebook"
        variants={fadeInUp}
      >
        The page you’re looking for seems to be lost in space. It might have
        been moved, or it doesn’t exist anymore.
      </motion.p>

      {/* Illustration */}
      <motion.img
        src="/404-illustration.svg"
        alt="404 Illustration"
        className="w-80 h-auto mt-8 "
        initial={{ opacity: 0, y: 50, rotate: 10 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{
          delay: 0.4,
          duration: 1.2,
          ease: [0.42, 0, 0.58, 1],
        }}
      />

      {/* Button */}
      <motion.a
        className="mt-8 px-8 py-3 bg-facebook text-white font-semibold rounded-md shadow-lg hover:bg-facebook-dark transition-all duration-300"
        variants={fadeInUp}
        whileHover={buttonHover.hover}
        whileTap={buttonHover.tap}
      >
        <Link to="/">Go Back Home</Link>
      </motion.a>
    </motion.div>
  );
};

export default NotFound;
