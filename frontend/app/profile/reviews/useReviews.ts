"use client";

import { useMemo, useState } from "react";
import type { Review, ReviewsSort, ReviewsTab } from "./types";
import { fetchMyReviewsApi } from "./api";

/**
 * This file encapsulates all review-related state and logic.
 * Responsibilities:
 * - Fetching reviews from backend
 * - Managing load state
 * - Handling UI state
 * - Deriving filtered + sorted review lists
 */
export function useReviews() {
  // raw reviews from backend
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [activeTab, setActiveTab] = useState<ReviewsTab>("all");
  const [query, setQuery] = useState(""); // User input value
  const [sort, setSort] = useState<ReviewsSort>("default"); // Sorting mode

  async function refreshReviews() {
    setLoadingReviews(true);
    try {
      const data = await fetchMyReviewsApi();
      setReviews(data);
    } catch (e) {
      console.error(e);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }

  // Filters by active tab, query, and sorting mode
  const filteredReviews = useMemo(() => {
    const q = query.toLowerCase();

    const base = reviews
      .filter((r) => activeTab === "all" || r.kind === activeTab)
      .filter((r) => r.title.toLowerCase().includes(q));

    const sorted = [...base].sort((a, b) => {
      if (sort === "high") return b.reviewRating - a.reviewRating;
      if (sort === "low") return a.reviewRating - b.reviewRating;
      if (sort === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    return sorted;
  }, [reviews, activeTab, query, sort]);

  // Precompute counts for All / Movie / Song tabs.
const tabCounts = useMemo(
  () => ({
    all: reviews.length,
    movie: reviews.filter((r) => r.kind === "movie").length,
    song: reviews.filter((r) => r.kind === "song").length,
    tv: reviews.filter((r) => r.kind === "tv").length,
  }),
  [reviews]
);

  return {
    // Raw data
    reviews,

    // Dervied data
    filteredReviews,
    tabCounts,

    // UI state
    loadingReviews,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    sort,
    setSort,

    // Actions
    refreshReviews,
  };
}