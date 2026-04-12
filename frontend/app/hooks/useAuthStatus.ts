"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type CurrentUser = {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  avatar?: string | null;
};

const API_BASE_URL = "http://localhost:8000";

export function useAuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/current_user`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setIsLoggedIn(true);
        setCurrentUser(response.data);
      } catch (error) {
        console.error(error);
        localStorage.removeItem("accessToken");
        setIsLoggedIn(false);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    void checkAuth();
  }, []);

  return { isLoggedIn, authLoading, currentUser };
}