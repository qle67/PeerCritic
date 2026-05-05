"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, Share2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ReviewsSort, ReviewsTab } from "./types";
import { useReviews } from "./useReviews";
import { Card } from "@/components/ui/card";
import { deleteMyReviewApi } from "./api";

// UI-only. Review logic in useReviews()
export default function ReviewsPanel() {
  const {
    reviews,          // raw list from API
    filteredReviews,  // reviews after tab + search + sort are applied
    tabCounts,        // keep count for All/Movie/Song tabs
    loadingReviews,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    sort,
    setSort,
    refreshReviews,   // function for reloading reviews
  } = useReviews();

  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  function toggleReview(reviewId: number) {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  }

  async function handleDeleteReview(reviewId: number) {
    try {
      await deleteMyReviewApi(reviewId);
      setOpenMenuId(null);
      setMenuPos(null);
      refreshReviews();
    } catch (error) {
      console.error(error);
      alert("Could not delete review.");
    }
  }

  async function handleShareReview(title: string) {
    const shareText = `Check out my review for ${title}`;

    if (navigator.share) {
      await navigator.share({
        title: "PeerCritic Review",
        text: shareText,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard.");
    }
  }

  useEffect(() => {
    function onDocMouseDown() {
      if (openMenuId !== null) {
        setOpenMenuId(null);
        setMenuPos(null);
      }
    }

    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [openMenuId]);

  useEffect(() => {
    refreshReviews();
  }, []);

  return (
    <div className="w-full max-w-xl flex flex-col min-h-0 self-start">

      {/*Outer card + scroll container*/}
      <div className="rounded-lg border border-orange-200 bg-orange-50/80 backdrop-blur-sm p-6 shadow-sm flex flex-col min-h-0 max-h-[calc(100vh-16rem)]">

        {/*Header*/}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Reviews</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loadingReviews ? "Loading..." : `${reviews.length} total`}
            </p>
          </div>

          {/*Tabs*/}
          <div className="inline-flex items-center gap-1">
            {(
              [
                { key: "all", label: "All", count: tabCounts.all },
                { key: "movie", label: "Movies", count: tabCounts.movie },
                { key: "song", label: "Songs", count: tabCounts.song },
                { key: "tv", label: "TV Shows", count: tabCounts.tv },
              ] as const
            ).map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={activeTab === t.key ? "default" : "ghost"}
                onClick={() => setActiveTab(t.key as ReviewsTab)}
                className={`rounded-full px-4 border-orange-300 ${activeTab === t.key
                  ? "bg-orange-400 text-white hover:bg-orange-500"
                  : "bg-orange-100 text-gray-800 hover:bg-orange-200"
                  }`}
              >
                <span className="mr-2">{t.label}</span>
                <span
                  className={`text-xs ${activeTab === t.key
                    ? "text-primary-foreground/90"
                    : "text-muted-foreground"
                    }`}
                >
                  ({t.count})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/*Search and Sort UI controls*/}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-full"
          />

          <select
            className="h-10 rounded-md border border-orange-200 bg-orange-100 text-gray-800 px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 sm:w-[180px]"
            value={sort}
            onChange={(e) => setSort(e.target.value as ReviewsSort)}
          >
            <option value="default">Default order</option>
            <option value="high">Highest rating</option>
            <option value="low">Lowest rating</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/*List*/}
        <div className="mt-4 flex-1 overflow-y-auto pb-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100">
          {loadingReviews ? (
            <div className="text-muted-foreground">Loading your reviews…</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-muted-foreground">
              {reviews.length === 0
                ? "You haven’t written any reviews yet."
                : "No reviews match your filters."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((r) => {
                const reviewText = r.review?.trim() || "No written review.";
                const isExpanded = !!expandedReviews[r.reviewId];
                const isLongReview = reviewText.length > 250;

                return (
                  <Card
                    key={r.reviewId}
                    className="relative border-orange-200 bg-orange-50 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="p-4 pr-28">
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleShareReview(r.title)}
                          className="rounded-full border border-orange-200 bg-orange-100 p-2 text-gray-700 transition hover:bg-orange-200"
                          aria-label="Share review"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>

                        <div>
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              const rect = e.currentTarget.getBoundingClientRect();
                              const isOpen = openMenuId === r.reviewId;

                              if (isOpen) {
                                setOpenMenuId(null);
                                setMenuPos(null);
                                return;
                              }

                              setOpenMenuId(r.reviewId);
                              setMenuPos({
                                top: rect.bottom + window.scrollY + 6,
                                left: rect.right + window.scrollX,
                              });
                            }}
                            className="rounded-full border border-orange-200 bg-orange-100 p-2 text-gray-700 transition hover:bg-orange-200"
                            aria-label="Review options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === r.reviewId &&
                            menuPos &&
                            createPortal(
                              <div
                                className="fixed z-[9999]"
                                style={{
                                  top: menuPos.top,
                                  left: menuPos.left,
                                  transform: "translateX(-100%)",
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className="w-44 rounded-md border border-orange-200 bg-orange-50 shadow-md p-1">
                                  <button
                                    type="button"
                                    className="w-full rounded-sm px-2 py-2 text-left text-sm text-red-600 hover:bg-orange-100"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteReview(r.reviewId);
                                    }}
                                  >
                                    Delete Review
                                  </button>
                                </div>
                              </div>,
                              document.body
                            )}
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        {/*Cover*/}
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-orange-200 bg-orange-100">
                          {r.cover ? (
                            <img
                              src={r.cover}
                              alt={r.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              No cover
                            </div>
                          )}
                        </div>

                        {/*Main info*/}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-900">
                                {r.title}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="rounded-full border border-orange-200 px-2 py-0.5 text-xs bg-orange-100 text-gray-600">
                                  {r.kind === "movie" ? "Movie" : r.kind === "song" ? "Song" : "TV Show"}
                                </span>

                                {r.reviewRatingCount != null && (
                                  <span className="text-xs text-gray-500">
                                    {r.reviewRatingCount} ratings
                                  </span>
                                )}
                              </div>
                            </div>

                            {/*Rating pill*/}
                            <div className="shrink-0 flex items-center gap-2">

                              {/* Rating pill */}
                              <div className="flex items-center gap-1 rounded-full border border-orange-300 bg-orange-200/70 px-3 py-1">
                                <Star className="h-4 w-4 fill-[#F3B413] text-[#F3B413]" />
                                <span className="text-sm font-semibold text-blue-700">
                                  {r.reviewRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-500">/10</span>
                              </div>
                            </div>
                          </div>

                          {/*Review text*/}
                          <div className="mt-3 border-t border-orange-100 pt-2">
                            <p
                              className={
                                isExpanded || !isLongReview
                                  ? "text-sm leading-5 text-gray-800 whitespace-pre-wrap break-words"
                                  : "text-sm leading-5 text-gray-800 line-clamp-3 whitespace-pre-wrap break-words"
                              }
                            >
                              {reviewText}
                            </p>

                            {isLongReview && (
                              <button
                                type="button"
                                onClick={() => toggleReview(r.reviewId)}
                                aria-expanded={isExpanded}
                                className="mt-1.5 text-sm font-medium text-orange-700 hover:underline"
                              >
                                {isExpanded ? "Show less" : "Read more"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}