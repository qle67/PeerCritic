"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ReviewsTab } from "./types";
import { useReviews } from "./useReviews";

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

  useEffect(() => {
    refreshReviews();
  }, []);

  return (
    <div className="w-full max-w-xl flex flex-col min-h-0 self-start">

      {/*Outer card + scroll container*/}
      <div className="rounded-lg border border-border bg-background/80 backdrop-blur-sm p-6 shadow-sm flex flex-col min-h-0 max-h-[calc(100vh-16rem)]">

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
              ] as const
            ).map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={activeTab === t.key ? "default" : "ghost"}
                onClick={() => setActiveTab(t.key as ReviewsTab)}
                className={`rounded-full px-4 border-orange-300 ${
                  activeTab === t.key
                    ? "bg-orange-400 text-white hover:bg-orange-500"
                    : "bg-background text-black hover:bg-orange-100"
                }`}
              >
                <span className="mr-2">{t.label}</span>
                <span
                  className={`text-xs ${
                    activeTab === t.key
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
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-[180px]"
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
          >
            <option value="default">Default order</option>
            <option value="high">Highest rating</option>
            <option value="low">Lowest rating</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </div>

        {/*List*/}
        <div className="mt-4 flex-1 overflow-y-auto pb-2">
          {loadingReviews ? (
            <div className="text-muted-foreground">Loading your reviews…</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-muted-foreground">
              {reviews.length === 0
                ? "You haven’t written any reviews yet."
                : "No reviews match your filters."}
            </div>
          ) : (
            <div className="divide-y divide-border rounded-md border border-border bg-background/60">
              {filteredReviews.map((r) => (
                <details key={r.reviewId} className="group">
                  <summary className="flex cursor-pointer list-none items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                    {/*Cover*/}
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
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

                    {/*Main info (title, meta, rating, preview) */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">
                            {r.title}
                          </div>
                          {/*Type label + rating count*/}
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-border px-2 py-0.5 text-xs bg-background text-muted-foreground">
                              {r.kind === "movie" ? "Movie" : "Song"}
                            </span>
                            {r.reviewRatingCount != null && (
                              <span className="text-xs text-muted-foreground">
                                {r.reviewRatingCount} ratings
                              </span>
                            )}
                          </div>
                        </div>

                        {/*Rating pill*/}
                        <div className="shrink-0 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
                          <Star className="h-4 w-4 fill-[#F3B413] text-[#F3B413]" />
                          <span className="text-sm font-semibold text-blue-700">
                            {r.reviewRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /10
                          </span>
                        </div>
                      </div>

                      {/*One-line preview of review text*/}
                      <div className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                        {r.review ? (
                          r.review
                        ) : (
                          <span className="text-muted-foreground/70">
                            No written review.
                          </span>
                        )}
                      </div>
                      
                      {/*Expand view*/}
                      <div className="mt-2 text-xs text-muted-foreground/70 group-open:hidden">
                        Click to expand
                      </div>
                    </div>
                  </summary>

                  {/*Expanded content*/}
                  <div className="px-4 pb-4 pt-0">
                    <div className="rounded-md bg-background/70 p-3 text-sm text-foreground border border-border/50">
                      {r.review ? (
                        r.review
                      ) : (
                        <span className="text-muted-foreground/70">
                          No written review.
                        </span>
                      )}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}