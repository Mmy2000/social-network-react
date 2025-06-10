import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import apiService from "@/apiService/apiService";
import { Link } from "react-router-dom";

const SearchInput = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // used to detect outside clicks

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim()) {
        setLoading(true);
        apiService
          .get(`/accounts/search/?q=${query}`)
          .then((res) => setResults(res.data))
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-facebook transition-colors duration-200" />
        </div>
        <Input
          autoComplete="off"
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-10 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-facebook focus:bg-white transition-all duration-200 shadow-sm focus:shadow-md"
        />
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white bg-white border border-gray-200 rounded-lg shadow-md p-4 z-10"
          >
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Searching...</p>
            ) : results.length > 0 ? (
              results.map((user) => (
                <Link
                  to={`/profile/${user?.id}`}
                  key={user.id}
                  className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 rounded"
                >
                  <img
                    src={user?.profile?.profile_picture}
                    alt={user?.profile?.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium dark:text-white">
                      {user?.profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No users found.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
