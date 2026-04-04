"use client"

import Navbar from "@/app/navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import HomePageMovies from "@/app/home-page-carousels";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

// Define TypeScript type for Search Movies object returned by API
type Movie = {
  movieId: number;
  movieName: string;
  description: string;
  year: number;
  length: string;
  cover: string;
  backDrop: string;
  movieRating: number;
  movieRatingCount: number;
}

export default function Home() {

  // State to hold the fetched Search Movies 
  const [movies, setMovies] = useState<Movie[]>([]);


  // Async function to fetch Search Movies from API
  async function searchMovies() {

    try {
      // Send a GET resquest to the search movies endpoint using the id from the URL
      const response = await axios.get("http://localhost:8000/movies", {
        headers: {
          "Accept": 'application/json'
        },
        params: {
          page: 1,      // Request the first page of result
          size: 8,     // Limit results to 8 search movies
          search_text: "",
        }
      });
      // Get the item array from the Search Movies responses and store it in state
      setMovies(response.data.items as Movie[]);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    searchMovies();
  }, []);


  return (
    <div className="mx-auto">
      <Navbar />

      <div className="w-full mt-5 px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          orientation="horizontal"
          className="mx-full relative">
          <CarouselContent>
            {movies.map(movie => (
              <CarouselItem key={movie.movieId}>
                <div className="">
                  <Card className="py-0">
                    <CardContent className="flex h-130 items-center justify-center px-0 py-0 relative">
                      <img className="object-fit w-full aspect-21/9" src={movie.backDrop} alt={movie.movieName} />
                      <div className="absolute top-1/2 left-0 h-full w-200"></div>
                      <Link href={"/movies/" + movie.movieId}
                        className="absolute bottom-0 left-0 flex w-200">
                        <div className="flex flex-col gap-2 bg-gray-600/50 p-4">
                          <h1 className="text-white text-4xl font-bold">{movie.movieName}</h1>
                          <h3 className="text-white text-lg italic font-semibold">{movie.description}</h3>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-10 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute -right-10 top-1/2 -translate-y-1/2 z-10" />
        </Carousel>
      </div>

      <HomePageMovies />
    </div>
  );
}
