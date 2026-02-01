"use client"

import Navbar from "@/app/navbar";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Star} from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

export default function Page() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie>();
  
  useEffect(() => {
    fetchMovie();
  }, []);

  async function fetchMovie() {
    try {
      const response = await axios.get("http://localhost:8000/movies/" + params.id, {
        headers: {
          "Accept": 'application/json'
        }
      });
      console.log(response);
      setMovie(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div className="mx-auto">
      <Navbar />
      <div>
        {movie !== undefined && (
          <div className="mt-6 flex w-full">
            <div className="grow-1">
              <div className="flex flex-col items-center">
                <img src={movie.cover} alt={movie.movieName} width="200" height="400"/>
                <div className="mt-2">
                  {movie.genres.map(genre => (
                    <Badge className="mr-1 rounded-sm">{genre}</Badge>
                  ))}
                </div>
                
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
                </div>
              </div>
              
              <div className="text-lg font-bold justify-self-center mt-5">Reviews</div>
            </div>
            
            <div className="grow-1">
              <h1 className="text-4xl font-bold justify-self-center">{movie.movieName}</h1>
              <div className="mt-5 flex items-center justify-center">
                <Star className="mr-5" fill="#F3B413" color="#F3B413" size={100}/>
                <div className="text-7xl font-bold text-blue-700">{movie.movieRating}</div>
              </div>
              
              <div
                className="flex font-bold text-xl justify-self-center border-orange-300 border-3 p-2 rounded-lg mt-8">
                You Rated:&nbsp;
                <div className=" font-bold text-blue-700">10</div>
              </div>
              
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
              
              <div className="bg-orange-300 justify-self-center w-100 border-orange-400 border-3 rounded-lg mt-8 p-1">
                <div className="text-xl font-bold justify-self-center mt-1">Your Friends' Ratings</div>
              </div>
            </div>
            
            <div className="grow-1">
              <div className="text-lg font-bold justify-self-center">Summary</div>
              <div className="w-100 justify-self-center border-3 border-orange-300 p-3 rounded-lg font-semibold">{movie.description}</div>
              <div className="text-lg font-bold justify-self-center mt-5">Similar Movies</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}