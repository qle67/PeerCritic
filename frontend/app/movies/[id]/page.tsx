"use client"

import Navbar from "@/app/navbar";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Star} from "lucide-react";
import { Button } from "@/components/ui/button";
import {Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";

/* Define Episode data structure */
type Episode = {
  episodeId: number;
  episodeNumber: number;
  episodeName: string;
  season: number;
  movieId: number;
}

/* Define Movie or show data structure */
type Movie = {
  movieId: number;
  movieName: string;
  description: string;
  year: number;
  length: string;
  cover: string;
  movieRating: number;
  movieRatingCount: number;
  writers: string[];
  actors: string[];
  directors: string[];
  genres: string[];
  episodes: Episode[];
}

export default function Page() {
  const params = useParams();         // Get URL parameters
  // State management
  const [movie, setMovie] = useState<Movie>();   
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  
  // Fetch movie and similar movies
  useEffect(() => {
    fetchMovie();
    fetchSimilarMovies();
  }, []);
  
  // Fetch detailed movie from API
  async function fetchMovie() {
    try {
      const response = await axios.get("http://localhost:8000/movies/" + params.id, {
        headers: {
          "Accept": 'application/json'
        }
      });
      // console.log(response);
      setMovie(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Fetch similar movies based on share genres
  async function fetchSimilarMovies() {
    try {
      const response = await axios.get("http://localhost:8000/movies/" + params.id + "/similar", {
        headers: {
          "Accept": 'application/json'
        },
        params: {
          page: 1,
          size: 20,
        }
      });
      console.log(response);
      if (response && response.data) {
        setSimilarMovies(response.data.items);
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div className="mx-auto">
      <Navbar />
      <div>
        {/* Only show content when movie data is loaded */}
        {movie !== undefined && (
          <div className="mt-6 flex w-full gap-8 px-8">
            
            {/* Left column for poster, genres and information of a movie*/}
            <div className="grow-1">
              <div className="flex flex-col items-center">
                {/* Movie Poster */}
                <img src={movie.cover} alt={movie.movieName} width="200" height="400"/>
                {/* genre badges */}
                <div className="mt-2">
                  {movie.genres.map((genre, index) => (
                    <Badge key={index} className="mr-1 rounded-sm">{genre}</Badge>
                  ))}
                </div>

                {/* Information card: Directors, writers, actors, year, runtime */}
                <div className="bg-orange-300 w-90 border-orange-400 border-3 rounded-lg mt-2 p-3">
                  <div>
                    <strong>Directors: </strong>
                    {movie.directors.join(", ")}  {/* Join array with commas */}
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

                  {/* Only show episodes if there is any episode */}
                  {movie.episodes.length > 0 && (
                    <div>
                      <div>
                        <strong>Episodes: </strong>
                        {movie.episodes.length}
                      </div>
                      <div>
                        <strong>Seasons: </strong>
                        {/* Calculate max season number from episode array */}
                        {movie.episodes.reduce((max, episode) => Math.max(max, episode.season), 1)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Episode list for TV shows only */}
              {movie.episodes.length > 0 && (
                <div className="flex flex-col items-center">
                  <div className="text-lg font-bold mt-5">Episodes</div>
                  
                  {/* Map and create a card for each episode */}
                  {movie.episodes.map(episode => (
                    <Card key={episode.episodeId} className="w-90 mt-1 bg-orange-200 border-orange-400 border-1 mt-2">
                      <CardHeader>
                        <CardTitle>Episode {episode.episodeNumber}</CardTitle>
                        <CardDescription>{episode.episodeName}</CardDescription>
                        <CardAction>Season {episode.season}</CardAction>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}

              {/* Friends' Ratings */}
              <div className="bg-orange-300 justify-self-center w-90 border-orange-400 border-3 rounded-lg mt-8 p-1">
                <div className="text-xl font-bold justify-self-center mt-1">Your Friends' Ratings</div>
              </div>
            </div>

            {/* Center column for title, rating, buttons and review list*/}
            <div className="grow-1">
              {/* Movie title */}
              <h1 className="text-4xl font-bold justify-self-center">{movie.movieName}</h1>

              {/* Rating display */}
              <div className="mt-5 flex items-center justify-center">
                <Star className="mr-5" fill="#F3B413" color="#F3B413" size={100}/>
                <div className="text-7xl font-bold text-blue-700">{movie.movieRating}</div>
              </div>

              {/* User rating */}
              <div
                className="flex font-bold text-xl justify-self-center border-orange-300 border-3 p-2 rounded-lg mt-8">
                You Rated:&nbsp;
                <div className=" font-bold text-blue-700">10</div>
              </div>

              {/* Buttons: rate, review, share link and watch trailer */}
              <div className="mt-8 flex justify-center gap-5">
                <Button className="bg-orange-400">RATE</Button>
                <Button className="bg-orange-400">REVIEW</Button>
                <Button className="bg-orange-400">SHARE</Button>
              </div>
              <div className="mt-8 justify-self-center">
                <Button
                  className="text-xl font-bold bg-orange-200 text-grey-500 p-7 rounded-xl border-3 border-orange-300">Watch
                  Trailer</Button>
              </div>

              {/* Reviews section */}
              <div className="text-xl font-bold justify-self-center mt-5">Reviews</div>
              
              <div>

              </div>
            </div>

            {/* Right column for summary and similar movies/TV shows */}
            <div className="grow-1">
              {/* Summary section */}
              <div className="text-lg font-bold justify-self-center">Summary</div>
              <div className="w-100 justify-self-center border-3 border-orange-300 p-3 rounded-lg font-semibold">{movie.description}</div>
              <div className="text-lg font-bold justify-self-center mt-5">Similar Movies/TV Shows</div>

              {/* Similar Movies/shows section */}
              {similarMovies.map(similarMovie => (
                <Card key={similarMovie.movieId} className="w-90 mt-1 justify-self-center bg-orange-200 border-orange-400 border-1 mt-2">
                  <CardHeader>
                    <CardTitle>
                      <Link href={"/movies/" + similarMovie.movieId}>{similarMovie.movieName}</Link>
                    </CardTitle>
                    <CardDescription className="flex">
                      <div className="mr-9">{similarMovie.year}</div>
                      <div className="mr-9">{similarMovie.length}</div>
                      <Star className="mr-1" fill="#F3B413" color="#F3B413"/>
                      <div className="font-bold ">{similarMovie.movieRating}</div>
                    </CardDescription>
                    <CardAction>
                    <img src={similarMovie.cover} alt={similarMovie.movieName} width="60" height="40"/>
                    </CardAction>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}