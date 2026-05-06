"use client"

import Navbar from "@/app/navbar";
import { useParams, usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import FriendReviews from "@/app/viewfriendreviews/friendReviews";
import MediaReviews from "@/app/viewreviews/mediaReviews";
import api from "@/app/apiClient";
import { Input } from "@/components/ui/input";
import ReviewForm from "@/app/reviewform/reviewForm";
import { AnimatePresence, motion } from "framer-motion";

/* Define TypeScript type for episode object returned by API */
type Episode = {
  episodeId: number;
  episodeNumber: number;
  episodeName: string;
  season: number;
  movieId: number;
}

/* Define TypeScript type for movie object returned by API */
type Movie = {
  movieId: number;
  movieName: string;
  description: string;
  year: number;
  length: string;
  cover: string;
  video: string;
  movieRating: number;
  movieRatingCount: number;
  writers: string[];
  actors: string[];
  directors: string[];
  genres: string[];
  episodes: Episode[];
}

type Friend = {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
};

// Export default page component rendered at the /movies/[id] route
export default function Page() {
  // Get route parameters from the URL
  const params = useParams();

  const router = useRouter();

  const pathname = usePathname();

  // State variable to hold fetched movie details
  const [movie, setMovie] = useState<Movie>();

  // State variable to hold fetched similar movies
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  // Extract movie id from route params
  const movieId = Array.isArray(params.id) ? params.id[0] : params.id;

  // State variable to control review form modal visibility
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendQuery, setFriendQuery] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");

  // Fetch movie details and similar movies when movie id changes
  useEffect(() => {
    if (!movieId) return;

    let isCancelled = false;

    async function loadMoviePage() {
      try {
        const [movieResponse, similarResponse] = await Promise.all([
          axios.get(`http://localhost:8000/movies/${movieId}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          axios.get(`http://localhost:8000/movies/${movieId}/similar`, {
            headers: {
              Accept: "application/json",
            },
            params: {
              page: 1,
              size: 20,
            },
          }),
        ]);

        if (isCancelled) return;

        setMovie(movieResponse.data);
        setSimilarMovies(similarResponse?.data?.items ?? []);
      } catch (error) {
        if (!isCancelled) {
          console.error(error);
        }
      }
    }

    void loadMoviePage();

    // Prevent state updates after component unmounts
    return () => {
      isCancelled = true;
    };
  }, [movieId]);

  function handleReviewClick() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsReviewFormOpen(true);
  }

  async function openShareModal() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = `/login?next=${encodeURIComponent(`/movies/${movieId}`)}`;
      return;
    }

    try {
      const response = await api.get("/my/friends");
      setFriends(response.data ?? []);
      setShareOpen(true);
    } catch (error) {
      console.error(error);
      alert("Could not load friends.");
    }
  }

  async function shareMovieToFriend(friendId: number) {
    if (!movie) return;

    try {
      const dmResponse = await api.post(`/messages/dm/${friendId}`, {});
      const conversationId = dmResponse.data.conversationId;

      await api.post(`/messages/conversations/${conversationId}/messages`, {
        messageText: "Shared media",
        messageType: "media_share",
        sharedMovieId: movie.movieId,
        sharedSongId: null,
      });

      setShareOpen(false);
      setFriendQuery("");
      setShareSuccess("Media sent!");

      setTimeout(() => {
        setShareSuccess("");
      }, 2500);
    } catch (error) {
      console.error(error);
      alert("Could not share media.");
    }
  }

  // Render movie detail page UI
  return (
    // Outer page container
    <div className="mx-auto">
      {/* Render navigation bar at the top of the page */}
      <Navbar />
      <div>
        {/* Only show page content after movie data is loaded */}
        {movie !== undefined && (
          <>
            <div className="mt-6 flex w-full gap-8 px-8">
              {/* Left column for poster, genres, details, episodes, and friend reviews */}
              <div className="grow-1">
                <div className="flex flex-col items-center">
                  {/* Movie poster */}
                  <img src={movie.cover} alt={movie.movieName} width="300" height="400" />

                  {/* Genre badges */}
                  <div className="mt-2">
                    {movie.genres.map((genre, index) => (
                      <Badge key={index} className="mr-1 rounded-sm">{genre}</Badge>
                    ))}
                  </div>

                  {/* Information card for directors, writers, actors, year, runtime, and episode totals */}
                  <div className="bg-orange-300 w-90 border-orange-400 border-3 rounded-lg mt-2 p-3">
                    <div>
                      <strong>Directors: </strong>
                      {movie.directors.join(", ")}
                    </div>
                    <div>
                      <strong>Writers: </strong>
                      {movie.writers.join(", ")}
                    </div>
                    <div>
                      <strong>Actors: </strong>
                      {movie.actors.join(", ")}
                    </div>
                    <div>
                      <strong>Release Year: </strong>
                      {movie.year}
                    </div>
                    <div>
                      <strong>Runtime: </strong>
                      {movie.length}
                    </div>

                    {movie.episodes.length > 0 && (
                      <div>
                        <div>
                          <strong>Episodes: </strong>
                          {movie.episodes.length}
                        </div>
                        <div>
                          <strong>Seasons: </strong>
                          {movie.episodes.reduce((max, episode) => Math.max(max, episode.season), 1)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Episode list shown only for TV shows */}
                {movie.episodes.length > 0 && (
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold mt-5">Episodes</div>

                    {movie.episodes.map((episode) => (
                      <Card key={episode.episodeId} className="w-90 mt-1 bg-orange-200 border-orange-400 border mt-2">
                        <CardHeader>
                          <CardTitle>Episode {episode.episodeNumber}</CardTitle>
                          <CardDescription>{episode.episodeName}</CardDescription>
                          <CardAction>Season {episode.season}</CardAction>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Friend reviews section */}
                <FriendReviews
                  mediaType={movie.episodes.length > 0 ? "show" : "movie"}
                  mediaId={movie.movieId}
                />
              </div>

              {/* Center column for title, rating, actions, trailer, and reviews */}
              <div className="grow-1">
                <h1 className="text-4xl font-bold justify-self-center">{movie.movieName}</h1>

                {/* Main rating display */}
                <div className="mt-5 flex items-center justify-center">
                  <Star className="mr-5" fill="#F3B413" color="#F3B413" size={100} />
                  <div className="text-7xl font-bold text-blue-700">{movie.movieRating}</div>
                </div>

                {/* User rating display */}
                <div className="flex font-bold text-xl justify-self-center border-orange-300 border-3 p-2 rounded-lg mt-8">
                  You Rated:&nbsp;
                  <div className="font-bold text-blue-700">10</div>
                </div>

                {/* Action buttons for reviewing and sharing */}
                <div className="mt-8 flex justify-center gap-5">
                  <Button className="bg-orange-400" onClick={handleReviewClick}>
                    REVIEW
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={openShareModal}
                    className="h-10 w-10 rounded-full border border-orange-200 bg-orange-100 text-gray-700 hover:bg-orange-200 transition-colors duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Official trailer section */}
                <div className="mt-8 justify-self-center flex flex-col justify-center">
                  <Button
                    variant="ghost"
                    className="text-xl font-bold bg-orange-200 text-grey-500 p-7 rounded-t-xl rounded-b-none border-3 border-orange-300"
                  >
                    Official Trailer
                  </Button>
                  <iframe
                    width="560"
                    height="315"
                    src={movie.video}
                    title={movie.movieName}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Reviews section */}
                <div className="mt-6 flex justify-center">
                  <div className="w-full max-w-xl">
                    <MediaReviews
                      mediaType={movie.episodes.length > 0 ? "show" : "movie"}
                      mediaId={movie.movieId}
                    />
                  </div>
                </div>
              </div>

              {/* Right column for summary and similar media recommendations */}
              <div className="grow-1 overflow-x-clip">
                <div className="text-lg font-bold justify-self-center">Summary</div>
                <div className="w-100 justify-self-center border-3 border-orange-300 p-3 rounded-lg font-semibold">
                  {movie.description}
                </div>

                {/* Similar movies or TV shows list */}
                <div className="text-lg font-bold justify-self-center mt-5">
                  Similar Movies/TV Shows
                </div>

                <div className="mt-2 space-y-2">
                  {similarMovies.map((similarMovie) => (
                    <div
                      key={similarMovie.movieId}
                      className="relative origin-right transition-transform duration-200 hover:-translate-x-2 hover:z-10"
                    >
                      <Link href={"/movies/" + similarMovie.movieId} className="block">
                        <Card className="w-90 justify-self-center border border-orange-400 bg-orange-200 shadow-sm transition-all duration-200 hover:border-orange-500 hover:shadow-lg">
                          <CardHeader>
                            <CardTitle className="line-clamp-1 transition-colors hover:text-orange-700">
                              {similarMovie.movieName}
                            </CardTitle>

                            <CardDescription className="flex items-center gap-3 flex-wrap">
                              <div>{similarMovie.year}</div>
                              <div>{similarMovie.length}</div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" fill="#F3B413" color="#F3B413" />
                                <div className="font-bold">{similarMovie.movieRating}</div>
                              </div>
                            </CardDescription>

                            <CardAction>
                              {/* Similar movie poster thumbnail */}
                              <img
                                src={similarMovie.cover}
                                alt={similarMovie.movieName}
                                width="60"
                                height="40"
                                className="rounded-md border border-orange-300 object-cover"
                              />
                            </CardAction>
                          </CardHeader>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review form modal */}
            <ReviewForm
              mediaType={movie.episodes.length > 0 ? "show" : "movie"}
              mediaId={movie.movieId}
              mediaTitle={movie.movieName}
              open={isReviewFormOpen}
              onClose={() => setIsReviewFormOpen(false)}
              onSuccess={() => window.location.reload()}
            />
            {shareOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                onClick={() => setShareOpen(false)}
              >
                <div
                  className="w-full max-w-md rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-lg font-bold text-gray-900">Share with a friend</h2>

                  <Input
                    className="mt-3 border-orange-200 bg-orange-100"
                    placeholder="Search friends..."
                    value={friendQuery}
                    onChange={(e) => setFriendQuery(e.target.value)}
                  />

                  <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
                    {friends
                      .filter((f) => {
                        const q = friendQuery.trim().toLowerCase();
                        if (!q) return true;

                        return `${f.firstName} ${f.lastName} ${f.username}`
                          .toLowerCase()
                          .includes(q);
                      })
                      .map((f) => (
                        <button
                          key={f.userId}
                          type="button"
                          onClick={() => shareMovieToFriend(f.userId)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-orange-100"
                        >
                          <div className="h-9 w-9 overflow-hidden rounded-full border border-orange-200 bg-orange-100">
                            {f.avatar ? (
                              <img
                                src={f.avatar}
                                alt={f.username}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                                ?
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {`${f.firstName} ${f.lastName}`.trim() || f.username}
                            </div>
                            <div className="truncate text-xs text-gray-600">@{f.username}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {shareSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="fixed bottom-6 right-6 z-50 rounded-xl border border-green-200 bg-green-50 px-6 py-4 text-base font-semibold text-green-700 shadow-lg"
                >
                  {shareSuccess}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}