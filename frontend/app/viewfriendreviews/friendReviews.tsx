"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MediaType = "movie" | "show" | "song";

type FriendReview = {
    reviewId: number;
    review: string | null;
    reviewRating: number;
    reviewRatingCount: number | null;

    userId: number;
    username: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;

    kind: "movie" | "song";
    title: string;
    cover?: string | null;
    movieId?: number | null;
    songId?: number | null;
};

type FriendReviewsProps = {
    mediaType: MediaType;
    mediaId: number;
    isLoggedIn: boolean;
};

const API_BASE_URL = "http://localhost:8000";

function getEndpoint(mediaType: MediaType, mediaId: number) {
    if (mediaType === "song") {
        return `${API_BASE_URL}/my/friends/reviews/song/${mediaId}`;
    }

    return `${API_BASE_URL}/my/friends/reviews/movie/${mediaId}`;
}

export default function FriendReviews({
    mediaType,
    mediaId,
    isLoggedIn,
}: FriendReviewsProps) {
    const [reviews, setReviews] = useState<FriendReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const endpoint = useMemo(() => getEndpoint(mediaType, mediaId), [mediaType, mediaId]);

    useEffect(() => {
        async function fetchFriendReviews() {
            if (!isLoggedIn) {
                setReviews([]);
                setError("");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("accessToken");
            if (!token) {
                setReviews([]);
                setError("");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await axios.get(endpoint, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                setReviews(response.data ?? []);
            } catch (err) {
                console.error(err);
                setError("Could not load friend reviews.");
                setReviews([]);
            } finally {
                setLoading(false);
            }
        }

        void fetchFriendReviews();
    }, [endpoint, isLoggedIn]);

    return (
        <div className="mt-8">
            <div className="bg-orange-300 justify-self-center w-90 border-orange-400 border-3 rounded-lg p-1">
                <div className="text-xl font-bold justify-self-center mt-1">
                    Your Friends&apos; Ratings
                </div>
            </div>

            <div className="justify-self-center w-90 mt-3">
                {!isLoggedIn ? (
                    <Card className="bg-orange-100 border-orange-300">
                        <CardContent className="p-4 text-sm text-gray-600">
                            Log in to see your friends&apos; reviews.
                        </CardContent>
                    </Card>
                ) : loading ? (
                    <Card className="bg-orange-100 border-orange-300">
                        <CardContent className="p-4 text-sm text-gray-600">
                            Loading friend reviews...
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4 text-sm text-red-700">
                            {error}
                        </CardContent>
                    </Card>
                ) : reviews.length === 0 ? (
                    <Card className="bg-orange-100 border-orange-300">
                        <CardContent className="p-4 text-sm text-gray-600">
                            None of your friends have reviewed this yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {reviews.map((r) => {
                            const displayName =
                                [r.firstName, r.lastName].filter(Boolean).join(" ").trim() || r.username;

                            return (
                                <details
                                    key={r.reviewId}
                                    className="group overflow-hidden rounded-lg border border-orange-300 bg-orange-100"
                                >
                                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4 hover:bg-orange-200/60 transition-colors">
                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-orange-300 bg-orange-200">
                                            {r.avatar ? (
                                                <img
                                                    src={r.avatar}
                                                    alt={displayName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-700">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold text-black">
                                                        {displayName}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-600">@{r.username}</div>
                                                </div>

                                                <div className="shrink-0 flex items-center gap-1 rounded-full border border-orange-300 bg-white px-3 py-1">
                                                    <Star className="h-4 w-4 fill-[#F3B413] text-[#F3B413]" />
                                                    <span className="text-sm font-semibold text-blue-700">
                                                        {r.reviewRating.toFixed(1)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">/10</span>
                                                </div>
                                            </div>

                                            <div className="mt-2 line-clamp-1 text-sm text-gray-700">
                                                {r.review || "No written review."}
                                            </div>

                                            <div className="mt-2 text-xs text-gray-500 group-open:hidden">
                                                Click to expand
                                            </div>
                                        </div>
                                    </summary>

                                    <div className="border-t border-orange-300 bg-white/60 px-4 pb-4 pt-3">
                                        <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-gray-800">
                                            {r.review || "No written review."}
                                        </div>
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}