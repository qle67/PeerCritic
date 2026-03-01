"use client";

/**
 * User Profile Page
 * 
 * Responsibilities:
 * - Layout of 3 different "panels" (Profile, Reviews, Friends)
 * - Coordinates feature state and behavior with custom hooks.
 * 
 * Each feature owns its own state and API Logic.
 */

import Navbar from "@/app/navbar";
import ProfileInfoPanel from "./profileInfo/ProfileInfoPanel";
import ReviewsPanel from "./reviews/ReviewsPanel";
import FriendsPanel from "./friends/FriendsPanel";
import { useFriends } from "./friends/useFriends";

export default function Page() {
  const friendsViewModel = useFriends();

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="px-10 pt-10">
        <h1 className="text-4xl font-bold">User Profile</h1>

        {/* Three-column layout
            1. Profile Info
            2. Reviews created by the users
            3. Friends List/Management
        */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">
          <ProfileInfoPanel />
          <ReviewsPanel />
          <FriendsPanel {...friendsViewModel} />
        </div>
      </div>
    </div>
  );
}