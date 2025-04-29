import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const SearchInput = () => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-facebook transition-colors duration-200" />
        </div>
        <Input
          ref={inputRef}
          autoComplete="off"
          type="search"
          placeholder="Search..."
          onFocus={() => setIsFocused(true)}
          className="pl-10 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-facebook focus:bg-white transition-all duration-200 shadow-sm focus:shadow-md"
        />
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-md p-4 z-10"
          >
            {/* Replace this with dynamic search results */}
            <p className="text-sm text-gray-500">
              Search results will appear here...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
