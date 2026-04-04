"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Define TypeScript type for Movies returned by API
type Movie = {
  movieId: number;
  movieName: string;
  year: number;
  length: string;
  cover: string;
  movieRating: number;
  movieRatingCount: number;
};

// Define TypeScript type for Genres returned by API
type Genre = {
  genreId: number;
  genreName: string;
};

export default function HomePageCarousels() {
  // State to hold fetched movies
  const [movies, setMovies] = useState<Movie[]>([]);

  // State to hold fetched genres
  const [genres, setGenres] = useState<Genre[]>([]);

  // State to hold selected genre
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Async function to fetch movies
  async function fetchMovies(genre: string = "") {
    try {
      const response = await axios.get("http://localhost:8000/movies", {
        headers: {
          Accept: "application/json",
        },
        params: {
          page: 1,
          size: 16,
          search_genre: genre !== "" ? genre : undefined,
        },
      });

      setMovies(response.data.items as Movie[]);
    } catch (error) {
      console.error(error);
    }
  }

  // Handle selecting a genre
  function onGenreSelected(genre: string) {
    const nextGenre = selectedGenre === genre ? "" : genre;
    setSelectedGenre(nextGenre);
    fetchMovies(nextGenre);
  }

  // Handle selecting all genres
  function onAllGenresSelected() {
    setSelectedGenre("");
    fetchMovies("");
  }

  // Fetch data on page load
  useEffect(() => {
    async function loadHomePageData() {
      try {
        const [genresResponse, moviesResponse] = await Promise.all([
          axios.get("http://localhost:8000/genres/movies", {
            headers: {
              Accept: "application/json",
            },
            params: {
              page: 1,
              size: 99,
            },
          }),
          axios.get("http://localhost:8000/movies", {
            headers: {
              Accept: "application/json",
            },
            params: {
              page: 1,
              size: 16,
            },
          }),
        ]);

        setGenres(genresResponse.data.items as Genre[]);
        setMovies(moviesResponse.data.items as Movie[]);
      } catch (error) {
        console.error(error);
      }
    }

    loadHomePageData();
  }, []);

  return (
    <div className="mx-12 mt-10 mb-16 overflow-x-hidden">
      {/*Header*/}
      <div className="flex items-center justify-between px-2 py-4">
        <h2 className="text-black text-3xl font-bold">Movies</h2>

        <Link
          href="/movies"
          className="flex items-center gap-2 text-orange-400 font-bold text-lg hover:text-orange-300 transition"
        >
          <span>See More</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      {/*Genre Carousel*/}
      <div className="px-2 py-2">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            <CarouselItem className="basis-auto">
              <Badge
                className={cn(
                  "cursor-pointer border-orange-400 px-4 py-2 text-sm bg-transparent text-gray-800 hover:bg-orange-400 hover:text-white",
                  selectedGenre === "" ? "bg-orange-400 text-white" : ""
                )}
                onClick={onAllGenresSelected}
              >
                All
              </Badge>
            </CarouselItem>

            {genres.map((genre) => (
              <CarouselItem key={genre.genreId} className="basis-auto">
                <Badge
                  className={cn(
                    "cursor-pointer border-orange-400 px-4 py-2 text-sm bg-transparent text-gray-800 hover:bg-orange-400 hover:text-white",
                    selectedGenre === genre.genreName
                      ? "bg-orange-400 text-white"
                      : ""
                  )}
                  onClick={() => onGenreSelected(genre.genreName)}
                >
                  {genre.genreName}
                </Badge>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/*Movie Carousel*/}
      <div className="mt-8 relative py-6 px-12">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full relative"
        >
          <CarouselContent>
            {movies.map((movie) => (
              <CarouselItem
                key={movie.movieId}
                className="basis-1/3 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 py-4"
              >
                <div className="px-2">
                  <Link href={`/movies/${movie.movieId}`} className="block">
                    <div className="relative transition-transform duration-200 hover:scale-[1.05] hover:z-10">
                      <Card className="bg-orange-200 border-orange-400 border rounded-lg pt-0 h-full">
                        <div className="w-full aspect-[2/3] overflow-hidden rounded-t-lg border-b border-orange-400">
                          {/*eslint-disable-next-line @next/next/no-img-element*/}
                          <img
                            src={movie.cover}
                            alt={movie.movieName}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        </div>

                        <CardHeader>
                          <CardTitle className="line-clamp-1">
                            {movie.movieName}
                          </CardTitle>

                          <CardDescription className="flex items-center gap-3 text-gray-500">
                            <span>{movie.year}</span>
                            <span>{movie.length}</span>
                            <div className="flex items-center gap-1">
                              <Star
                                className="h-4 w-4"
                                fill="#F3B413"
                                color="#F3B413"
                              />
                              <span className="font-bold text-gray-500">
                                {movie.movieRating}
                              </span>
                            </div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </Link>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 bg-white" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 bg-white" />
        </Carousel>
      </div>
    </div>
  );
}