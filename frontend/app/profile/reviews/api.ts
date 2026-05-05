import axios from "axios";
import type { Review } from "./types";

function authHeaders() {
  return {
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
    Accept: "application/json",
  };
}

// Fetches all reviews written by the current (logged in) user
export async function fetchMyReviewsApi(): Promise<Review[]> {
  const res = await axios.get("http://localhost:8000/my/reviews", {
    headers: authHeaders(),
  });
  // avoid undefined errors
  return res.data ?? [];
}

export async function deleteMyReviewApi(reviewId: number): Promise<void> {
  await axios.delete(`http://localhost:8000/my/reviews/${reviewId}`, {
    headers: authHeaders(),
  });
}