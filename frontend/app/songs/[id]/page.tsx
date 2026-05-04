"use client"

import Navbar from "@/app/navbar";
import { useParams, usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import FriendReviews from "@/app/viewfriendreviews/friendReviews";
import MediaReviews from "@/app/viewreviews/mediaReviews";
import ReviewForm from "@/app/reviewform/reviewForm";

// Define the TypeScript type for an Artist object returned by API
type Artist = {
  artistId: number;
  artistName: string;
}

// Define the TypeScript type for a Song object returned by API
type Song = {
  songId: number;
  songName: string;
  year: number;
  length: string;
  cover: string;
  video: string;
  songRating: number;
  songRatingCount: number;
  artists: string[] | Artist[];
  genres: string[];
  reviews: string[];
}

// Export the default page component rendered at the /songs/[id] route
export default function Page() {
  const params = useParams();         // Get URL parameters

  const router = useRouter();

  const pathname = usePathname();

  // State variable to hold the fetched song details
  const [song, setSong] = useState<Song>();

  // State variable to hold the list of similar songs
  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);

  const songId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  useEffect(() => {
    if (!songId) return;

    let isCancelled = false;

    async function loadSongPage() {
      try {
        const [songResponse, similarResponse] = await Promise.all([
          axios.get(`http://localhost:8000/songs/${songId}`, {
            headers: {
              Accept: "application/json",
            },
          }),
          axios.get(`http://localhost:8000/songs/${songId}/similar`, {
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

        setSong(songResponse.data);
        setSimilarSongs(similarResponse?.data?.items ?? []);
      } catch (error) {
        if (!isCancelled) {
          console.error(error);
        }
      }
    }

    void loadSongPage();

    return () => {
      isCancelled = true;
    };
  }, [songId]);

  function handleReviewClick() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsReviewFormOpen(true);
  }

  // Render the Song detail page UI
  return (
    // Outer container
    <div className="mx-auto">
      {/* Render the navigation bar at the top of the page*/}
      <Navbar />
      <div>
        {/* Only show content when song data is loaded */}
        {song !== undefined && (
          <>
            <div className="mt-6 flex w-full">
              {/* Left column for poster, genres and information of a song */}
              <div className="grow-1">
                <div className="flex flex-col items-center">
                  {/* song poster */}
                  <img src={song.cover} alt={song.songName} width={300} height={500} className="rounded-md object-cover" />
                  {/* genre badges */}
                  <div className="mt-2">
                    {song.genres.map((genre, index) => (
                      <Badge key={index} className="mr-1 rounded-sm">{genre}</Badge>
                    ))}
                  </div>

                  {/* Song information card */}
                  <div className="bg-orange-300 w-90 border-orange-400 border-3 rounded-lg mt-2 p-3">
                    <div>
                      <strong>Artist: </strong>
                      {song.artists.map((artist, index) => (
                        <span key={index}>{typeof artist === "string" ? artist : artist.artistName}</span>
                      ))}
                    </div>
                    <div>
                      <strong>Release Year: </strong>
                      {song.year}
                    </div>
                    <div>
                      <strong>Runtime: </strong>
                      {song.length}
                    </div>
                  </div>
                </div>

                {/*Friend's Ratings*/}
                <FriendReviews
                  mediaType="song"
                  mediaId={song.songId}
                />
              </div>

              {/* Center column for title, rating and action buttons of a song */}
              <div className="grow-1">
                {/* Song title */}
                <h1 className="text-4xl font-bold justify-self-center">{song.songName}</h1>
                {/* Rating display */}
                <div className="mt-5 flex items-center justify-center">
                  <Star className="mr-5" fill="#F3B413" color="#F3B413" size={100} />
                  <div className="text-7xl font-bold text-blue-700">{song.songRating}</div>
                </div>

                {/* User rating */}
                <div className="flex font-bold text-xl justify-self-center border-orange-300 border-3 p-2 rounded-lg mt-8">
                  You Rated:&nbsp;
                  <div className="font-bold text-blue-700">10</div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex justify-center gap-5">
                  <Button className="bg-orange-400" onClick={handleReviewClick}>
                    REVIEW
                  </Button>
                  <Button className="bg-orange-400">SHARE</Button>
                </div>

                {/* listen button */}
                <div className="mt-8 justify-self-center flex flex-col justify-center">
                  <Button
                    variant="ghost"
                    className="text-xl font-bold bg-orange-200 text-grey-500 p-7 rounded-t-xl rounded-b-none border-3 border-orange-300"
                  >
                    Music Video
                  </Button>
                  <iframe
                    width="560"
                    height="315"
                    src={song.video}
                    title={song.songName}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Reviews section */}
                <div className="mt-6 flex justify-center">
                  <div className="w-full max-w-xl">
                    <MediaReviews
                      mediaType="song"
                      mediaId={song.songId}
                    />
                  </div>
                </div>
              </div>

              {/* Right column for similar songs */}
              <div className="grow-1 overflow-x-clip">
                <div className="text-lg font-bold justify-self-center mt-5">Similar Songs</div>

                <div className="mt-2 space-y-2">
                  {similarSongs.map((similarSong) => (
                    <div
                      key={similarSong.songId}
                      className="relative origin-right transition-transform duration-200 hover:-translate-x-2 hover:z-10"
                    >
                      <Link href={"/songs/" + similarSong.songId} className="block">
                        <Card className="w-90 justify-self-center border border-orange-400 bg-orange-200 shadow-sm transition-all duration-200 hover:border-orange-500 hover:shadow-lg">
                          <CardHeader>
                            <CardTitle className="line-clamp-1 transition-colors hover:text-orange-700">
                              {similarSong.songName}
                            </CardTitle>

                            <CardDescription className="flex items-center gap-3 flex-wrap">
                              <div className="max-w-[140px] truncate">
                                {similarSong.artists.map((artist, index) => (
                                  <span key={index}>
                                    {index > 0 ? ", " : ""}
                                    {typeof artist === "string" ? artist : artist.artistName}
                                  </span>
                                ))}
                              </div>

                              <div>{similarSong.year}</div>

                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4" fill="#F3B413" color="#F3B413" />
                                <div className="font-bold">{similarSong.songRating}</div>
                              </div>
                            </CardDescription>

                            <CardAction>
                              <img
                                src={similarSong.cover}
                                alt={similarSong.songName}
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

            <ReviewForm
              mediaType="song"
              mediaId={song.songId}
              mediaTitle={song.songName}
              open={isReviewFormOpen}
              onClose={() => setIsReviewFormOpen(false)}
              onSuccess={() => window.location.reload()}
            />
          </>
        )}
      </div>
    </div>
  )
}