"use client";
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

import { jwtDecode } from "jwt-decode"; // <-- fixed import here

// Types
interface User {
  email: string;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
  loadingDomains: boolean;
}

interface AuthAllPolls {
  id: number;
  options: string[];
  title: string;
  userEmail: string;
}

interface AuthContextType extends AuthState {
  login: (userData: { token: string } & User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setAllPolls: Dispatch<SetStateAction<AuthAllPolls[]>>;
  allPolls: AuthAllPolls[];
}

// Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [allPolls, setAllPolls] = useState<AuthAllPolls[]>([]);
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isInitialized: false,
    loadingDomains: false,
  });

  const login = ({ token, ...user }: { token: string } & User) => {
    console.log("users:", user.user, token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user.user));

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user,
    }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      user: null,
    }));
  };

  const updateUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setState((prev) => ({
      ...prev,
      user,
    }));
  };

  const checkToken = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const decoded: any = jwtDecode(token); // <-- use jwtDecode directly here
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          logout();
          return;
        }

        setState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user: JSON.parse(user),
          isInitialized: true,
        }));
      } catch (err) {
        console.error("Token decode error:", err);
        logout();
      }
    } else {
      setState((prev) => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isInitialized: true,
      }));
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    const fetchAllPoll = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      try {
        const res = await fetch(`/api/live_poll?email=${user.email}`);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("Poll get failed:", {
            status: res.status,
            statusText: res.statusText,
            error: errorData.error,
            details: errorData.details,
          });
          return;
        }

        const data = await res.json();

        if (!data.data?.allPolls?.length) {
          console.log("Poll table not ready or no polls found.");
          return;
        }

        const pollsWithParsedOptions = data.data.allPolls.map((poll: any) => ({
          ...poll,
          options: safeParseJSON(poll.options),
        }));

        function safeParseJSON(value: string) {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }

        setAllPolls(pollsWithParsedOptions);
        localStorage.setItem(
          "allPolls",
          JSON.stringify(pollsWithParsedOptions)
        );
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchAllPoll();
  }, []);

  const authContextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    setAllPolls,
    allPolls,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
