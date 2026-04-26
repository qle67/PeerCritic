"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";

// Define allowed media types for posting reviews
type MediaType = "movie" | "show" | "song";

// Define props for the ReviewForm component
type ReviewFormProps = {
  mediaType: MediaType;
  mediaId: number;
  mediaTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

// Define base API URL
const API_BASE_URL = "http://localhost:8000";

// Helper function to return the correct review submission endpoint
function getEndpoint(mediaType: MediaType, mediaId: number) {
  if (mediaType === "song") {
    return `${API_BASE_URL}/my/reviews/song/${mediaId}`;
  }

  return `${API_BASE_URL}/my/reviews/movie/${mediaId}`;
}

// Helper function to clamp a number between a minimum and maximum
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// Helper function to round a number to one decimal place
function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

// Helper function to format rating display text
function formatRating(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

// Export review form component rendered inside review modal
export default function ReviewForm({
  mediaType,
  mediaId,
  mediaTitle,
  open,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  // State to store selected rating
  const [rating, setRating] = useState<number>(0);

  // State to store hovered preview rating
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // State to store written review text
  const [review, setReview] = useState("");

  // State to track submit loading state
  const [submitting, setSubmitting] = useState(false);

  // State to store submission error message
  const [error, setError] = useState("");

  // State key used to retrigger sparkle animation
  const [sparkleKey, setSparkleKey] = useState(0);

  // Memoized endpoint for current media item
  const endpoint = useMemo(() => getEndpoint(mediaType, mediaId), [mediaType, mediaId]);

  // Check if user is previewing a rating with hover
  const isPreviewing = hoverRating !== null;

  // Display hovered rating when previewing, otherwise selected rating
  const displayedRating = hoverRating ?? rating;

  // Reset form state whenever modal opens for a new media item
  useEffect(() => {
    if (open) {
      setRating(0);
      setHoverRating(null);
      setReview("");
      setSubmitting(false);
      setError("");
      setSparkleKey(0);
    }
  }, [open, mediaId, mediaType]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Do not render modal when closed
  if (!open) return null;

  // Helper function to calculate rating value from pointer position
  function getRatingFromPointer(
    event: React.MouseEvent<HTMLDivElement>,
    starIndex: number
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percent = clamp(offsetX / rect.width, 0, 1);
    const value = starIndex + percent;
    return roundToTenth(value);
  }

  // Submit review form to API
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Please log in to write a review.");
      return;
    }

    if (rating < 0 || rating > 10) {
      setError("Please choose a rating from 0 to 10.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await axios.post(
        endpoint,
        {
          review: review.trim() || null,
          reviewRating: rating,
        },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHoverRating(null);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError("Could not save your review.");
    } finally {
      setSubmitting(false);
    }
  }

  // Determine sparkle count based on selected rating
  const sparkleCount =
    rating >= 9 ? 8 :
    rating >= 7 ? 6 :
    rating >= 4 ? 5 : 4;

  // Determine sparkle travel distance based on selected rating
  const sparkleDistance =
    rating >= 9 ? 30 :
    rating >= 7 ? 24 :
    rating >= 4 ? 20 : 16;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-orange-300 bg-orange-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-orange-200 px-5 py-4">
          <div>
            <div className="text-lg font-bold text-gray-900">Write a Review</div>
            <div className="text-sm text-gray-600">{mediaTitle}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-600 transition hover:bg-orange-100 hover:text-gray-900"
            aria-label="Close review form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Your Rating
            </label>

            {/* Interactive rating picker */}
            <div className="rounded-xl border border-orange-200 bg-orange-100/70 p-4">
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  {/* Animated main star icon */}
                  <motion.div
                    animate={{
                      scale: isPreviewing
                        ? displayedRating >= 9 ? 1.45
                        : displayedRating >= 8 ? 1.32
                        : displayedRating >= 7 ? 1.22
                        : displayedRating >= 5 ? 1.12
                        : 1
                        : 1,
                      rotate: isPreviewing
                        ? displayedRating >= 9 ? [0, -4, 4, -3, 3, 0]
                        : displayedRating >= 7 ? [0, -2, 2, -1, 1, 0]
                        : 0
                        : 0,
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 220, damping: 16 },
                      rotate: {
                        duration: displayedRating >= 9 ? 0.45 : 0.6,
                        repeat: isPreviewing && displayedRating >= 7 ? Infinity : 0,
                        repeatDelay: displayedRating >= 9 ? 0.15 : 0.45,
                      },
                    }}
                    style={{
                      filter:
                        displayedRating >= 9
                          ? "drop-shadow(0 0 14px rgba(245,158,11,0.55))"
                          : displayedRating >= 7
                            ? "drop-shadow(0 0 10px rgba(245,158,11,0.35))"
                            : displayedRating >= 5
                              ? "drop-shadow(0 0 6px rgba(245,158,11,0.22))"
                              : "drop-shadow(0 0 2px rgba(245,158,11,0.10))",
                    }}
                    className="relative"
                  >
                    <Star
                      className="h-8 w-8"
                      fill={
                        displayedRating >= 9 ? "#F59E0B" :
                        displayedRating >= 7 ? "#F3B413" :
                        "#F4C542"
                      }
                      color={
                        displayedRating >= 9 ? "#F59E0B" :
                        displayedRating >= 7 ? "#F3B413" :
                        "#F4C542"
                      }
                    />
                  </motion.div>

                  {/* Sparkle burst effect when rating is selected */}
                  <motion.div
                    key={sparkleKey}
                    className="pointer-events-none absolute inset-0"
                    initial="idle"
                    animate="burst"
                  >
                    {Array.from({ length: sparkleCount }).map((_, i) => {
                      const angle = (360 / sparkleCount) * i;

                      return (
                        <motion.span
                          key={i}
                          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-yellow-400"
                          initial={{
                            x: "-50%",
                            y: "-50%",
                            scale: 0,
                            opacity: 0,
                          }}
                          animate={{
                            x: `calc(-50% + ${Math.cos((angle * Math.PI) / 180) * sparkleDistance}px)`,
                            y: `calc(-50% + ${Math.sin((angle * Math.PI) / 180) * sparkleDistance}px)`,
                            scale: [0, 1.2, 0.6],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: rating >= 9 ? 0.75 : rating >= 7 ? 0.6 : 0.45,
                            ease: "easeOut",
                            delay: 0.02 * i,
                          }}
                        />
                      );
                    })}
                  </motion.div>
                </div>

                {/* Animated numeric rating display */}
                <motion.div
                  key={formatRating(displayedRating)}
                  initial={{ scale: 0.94, opacity: 0.7, y: 4 }}
                  animate={{
                    scale:
                      displayedRating >= 9 ? 1.08 :
                      displayedRating >= 7 ? 1.04 :
                      displayedRating >= 4 ? 1.01 : 1,
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-[96px] rounded-full border border-orange-300 bg-white px-5 py-1.5 text-center text-2xl font-bold text-blue-700 shadow-sm tabular-nums"
                  style={{
                    boxShadow:
                      displayedRating >= 9
                        ? "0 0 0 4px rgba(251,191,36,0.12), 0 10px 24px rgba(245,158,11,0.18)"
                        : displayedRating >= 7
                          ? "0 0 0 3px rgba(251,191,36,0.10), 0 8px 18px rgba(245,158,11,0.14)"
                          : "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {formatRating(displayedRating)}
                </motion.div>

                <span className="text-sm font-medium text-gray-600">/10</span>
              </div>

              {/* Star row used for rating input */}
              <div
                className="flex justify-center gap-1"
                onMouseLeave={() => setHoverRating(null)}
              >
                {Array.from({ length: 10 }).map((_, index) => {
                  const fillPercent = clamp(displayedRating - index, 0, 1) * 100;

                  return (
                    <div
                      key={index}
                      className="relative h-8 w-8 cursor-pointer"
                      onMouseMove={(e) => {
                        setHoverRating(getRatingFromPointer(e, index));
                      }}
                      onClick={(e) => {
                        const nextRating = getRatingFromPointer(e, index);
                        setRating(nextRating);
                        if (nextRating >= 4) {
                          setSparkleKey((prev) => prev + 1);
                        }
                      }}
                    >
                      <Star className="absolute inset-0 h-8 w-8 text-orange-200" />
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fillPercent}%` }}
                      >
                        <Star className="h-8 w-8 fill-[#F3B413] text-[#F3B413]" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rating scale labels */}
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>0.0</span>
                <span>10.0</span>
              </div>

              {/* Rating helper text */}
              <div className="mt-2 text-center text-xs text-gray-500">
                Tap or hover to preview, click to set your rating.
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Review
            </label>

            {/* Review text input */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              placeholder="Write what you thought about it..."
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-orange-400"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-400 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-500 disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}