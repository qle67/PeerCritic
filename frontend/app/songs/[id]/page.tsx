"use client"

import Navbar from "@/app/navbar";
import {useParams, useRouter} from "next/navigation";
import axios from "axios";
import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Star} from "lucide-react";
import { Button } from "@/components/ui/button";
import {Card, CardAction, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";

// Define type of Artist data structure
type Artist = {
  artistId: number;
  artistName: string;
}

// Define type of Song data structure
type Song = {
  songId: number;
  songName: string;
  year: number;
  length: string;
  cover: string;
  songRating: number;
  songRatingCount: number;
  artists: string[] | Artist[];
  genres: string[];
  reviews: string[];
}


export default function Page() {
  const params = useParams();         // Get URL parameters
  // State management
  const [song, setSong] = useState<Song>();
  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);
  
  // Fetch song and similar songs
  useEffect(() => {
    fetchSong();
    fetchSimilarSongs();
  }, []);
  
  // Fetch song information
  async function fetchSong() {
    try {
      const response = await axios.get("http://localhost:8000/songs/" + params.id, {
        headers: {
          "Accept": 'application/json'
        }
      });
      console.log(response);
      setSong(response.data);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Fetch similar songs based on shared genres
  async function fetchSimilarSongs() {
    try {
      const response = await axios.get("http://localhost:8000/songs/" + params.id + "/similar", {
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
        setSimilarSongs(response.data.items);
      }
    } catch (error) {
      console.error(error);
    }
  }
  
  return (
    <div className="mx-auto">
      <Navbar />
      <div>
        {/* Only show content when song data is loaded */}
        {song !== undefined && (
          <div className="mt-6 flex w-full">
            
            {/* Left column for poster, genres and information of a song */}
            <div className="grow-1">
              <div className="flex flex-col items-center">
                {/* song poster */}
                <img src={song.cover} alt={song.songName} width="300" height="500"/>
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
              
              <div className="bg-orange-300 justify-self-center w-90 border-orange-400 border-3 rounded-lg mt-8 p-1">
                <div className="text-xl font-bold justify-self-center mt-1">Your Friends' Ratings</div>
              </div>
            </div>

            {/* Center column for title, rating and action buttons of a song */}
            <div className="grow-1">
              {/* Song title */}
              <h1 className="text-4xl font-bold justify-self-center">{song.songName}</h1>
              {/* Rating display */}
              <div className="mt-5 flex items-center justify-center">
                <Star className="mr-5" fill="#F3B413" color="#F3B413" size={100}/>
                <div className="text-7xl font-bold text-blue-700">{song.songRating}</div>
              </div>

              {/* User rating */}
              <div
                className="flex font-bold text-xl justify-self-center border-orange-300 border-3 p-2 rounded-lg mt-8">
                You Rated:&nbsp;
                <div className=" font-bold text-blue-700">10</div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex justify-center gap-5">
                <Button className="bg-orange-400">RATE</Button>
                <Button className="bg-orange-400">REVIEW</Button>
                <Button className="bg-orange-400">SHARE</Button>
              </div>
              {/* listen button */}
              <div className="mt-8 justify-self-center">
                <Button
                  className="text-xl font-bold bg-orange-200 text-grey-500 p-7 rounded-xl border-3 border-orange-300">Listen Preview</Button>
              </div>

              {/* Reviews section */}
              <div className="text-xl font-bold justify-self-center mt-5">Reviews</div>

              <div>

              </div>
            </div>

            {/* Right column for similar songs */}
            <div className="grow-1">
              <div className="text-lg font-bold justify-self-center mt-5">Similar Songs</div>
              {similarSongs.map(similarSong => (
                <Card key={similarSong.songId} className="w-90 mt-1 justify-self-center bg-orange-200 border-orange-400 border-1 mt-2">
                  <CardHeader>
                    
                    {/* Song title */}
                    <CardTitle>
                      <Link href={"/songs/" + similarSong.songId}>{similarSong.songName}</Link>
                    </CardTitle>
                    
                    {/* Song information */}
                    <CardDescription className="flex">
                      <div className="mr-9">
                        {similarSong.artists.map((artist, index) => (
                          <span key={index}>{typeof artist === "string" ? artist : artist.artistName}</span>
                        ))}
                      </div>
                      {/* Release year */}
                      <div className="mr-9">{similarSong.year}</div>
                      {/* Rating */}
                      <Star className="mr-1" fill="#F3B413" color="#F3B413"/>
                      <div className="font-bold ">{similarSong.songRating}</div>
                    </CardDescription>
                    
                    {/* Song poster */}
                    <CardAction>
                      <img src={similarSong.cover} alt={similarSong.songName} width="60" height="40"/>
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