"use client"

import Navbar from "@/app/navbar";
import {useEffect, useState} from "react";
import axios from "axios";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {SearchIcon, Star} from "lucide-react";
import {NativeSelect, NativeSelectOption} from "@/components/ui/native-select";
import {Label} from "@/components/ui/label";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

// Define TypeScript type for Search Movies object returned by API
type Movie = {
  movieId: number;
  movieName: string;
  year: number;
  length: string;
  cover: string;
  movieRating: number;
  movieRatingCount: number;
}

// Define TypeScript type for Search Movies Page object returned by API
type MoviePage = {
  items: Movie[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Define TypeScript type for Get Directors object returned by API
type Director = {
  directorId: number;
  directorName: string;
}

// Define TypeScript type for Get Directors Page object returned by API
type DirectorPage = {
  items: Director[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Define TypeScript type for Get Actors object returned by API
type Actor = {
  actorId: number;
  actorName: string;
}

// Define TypeScript type for Get Actors Page object returned by API
type ActorPage = {
  items: Actor[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Define TypeScript type for Get Writers object returned by API
type Writer = {
  writerId: number;
  writerName: string;
}

// Define TypeScript type for Get Writers Page object returned by API
type WriterPage = {
  items: Writer[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Define TypeScript type for Get Genres object returned by API
type Genre = {
  genreId: number;
  genreName: string;
}

// Define TypeScript type for Get Genres Page object returned by API
type GenrePage = {
  items: Genre[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Export the default page component rendered at the /movies route
export default function Page() {
  // State to hold the search text
  const [searchText, setSearchText] = useState<string>("");
  
  // State to hold the selected year
  const [selectedYear, setSelectedYear] = useState<string>("");
  
  // State to hold the fetched Search Movies 
  const [movies, setMovies] = useState<Movie[]>([]);
  
  // State to hold the fetched Get Directors
  const [directors, setDirectors] = useState<Director[]>([]);
  
  // State to hold the selected director
  const [selectedDirector, setSelectedDirector] = useState<string>("");
  
  // State to hold the fetched Get Actors
  const [actors, setActors] = useState<Actor[]>([]);
  
  // State to hold the selected actor
  const [selectedActor, setSelectedActor] = useState<string>("");
  
  // State to hold the fetched Get Writers
  const [writers, setWriters] = useState<Writer[]>([]);
  
  // State to hold the selected writer
  const [selectedWriter, setSelectedWriter] = useState<string>("");
  
  // State to hold the fetched Get Genres
  const [genres, setGenres] = useState<Genre[]>([]);
  
  // State to hold the selected genre
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  
  // Reset search options
  function reset() {
    setSearchText("");
    setSelectedYear("");
    setSelectedDirector("");
    setSelectedActor("");
    setSelectedWriter("");
    setSelectedGenre("");
  }
  
  function onSearchTextChange(text: string) {
    reset();
    setSearchText(text);
  }
  
  function onYearSelected(year: string) {
    reset();
    setSelectedYear(year);
  }
  
  function onDirectorSelected(director: string) {
    reset();
    setSelectedDirector(director);
  }
  
  function onActorSelected(actor: string) {
    reset();
    setSelectedActor(actor);
  }
  
  function onWriterSelected(writer: string) {
    reset();
    setSelectedWriter(writer);
  }
  
  function onGenreSelected(genre: string) {
    reset();
    setSelectedGenre(genre);
  }
  
  useEffect(() => {
    if (selectedYear || selectedActor || selectedWriter || selectedDirector || selectedGenre || searchText) {
      searchMovies();
    } else if (searchText === "") {
      searchMovies();
    }
  }, [searchText, selectedYear, selectedActor, selectedWriter, selectedDirector, selectedGenre]);
  
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
          size: 20,     // Limit results to 20 search movies
          search_text: searchText !== "" ? searchText : undefined,
          search_year: selectedYear !== "" ? selectedYear : undefined,
          search_writer: selectedWriter !== "" ? selectedWriter : undefined,
          search_actor: selectedActor !== "" ? selectedActor : undefined,
          search_director: selectedDirector !== "" ? selectedDirector : undefined,
          search_genre: selectedGenre !== "" ? selectedGenre : undefined,
        }
      });
      // Get the item array from the Search Movies responses and store it in state
      setMovies(response.data.items as Movie[]);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Async function to fetch Get Directors from API
  async function getDirectors() {
    try {
      // Send a Get resquest to the Get Directors endpoint using the id from the URL
      const response = await axios.get("http://localhost:8000/directors", {
        headers: {
          "Accept": 'application/json'
        },
        params: {
          page: 1,
          size: 99,
        }
      });
      // Get the item array from the Get Directors responses and store it in state
      setDirectors(response.data.items as Director[]);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Async function to fetch Get Actors from API
  async function getActors() {
    try {
      // Send a Get resquest to the Get Actors endpoint using the id from the URL
      const response = await axios.get("http://localhost:8000/actors", {
        headers: {
          "Accept": 'application/json'
        },
        params: {
          page: 1,
          size: 99,
        }
      });
      // Get the item array from the Get Actors responses and store it in state
      setActors(response.data.items as Actor[]);
    } catch (error) {
      console.error(error);
    }
  }
  
  // Async function to fetch Get Writers from API
  async function getWriters() {
      try {
        // Send a Get request to the Get Writers endpoint using the id from the URL
        const response = await axios.get("http://localhost:8000/writers", {
          headers: {
            "Accept": 'application/json'
          },
          params: {
            page: 1,
            size: 99,
          }
        });
        // Get the item array from the Get Writers responses and store it in state
        setWriters(response.data.items as Writer[]);
      } catch (error) {
        console.error(error);
      }
  } 
  
  // Async function to fetch Get Genres from API
  async function getGenres() {
    try {
      // Send a Get request to the Get Genres endpoint using the id from the URL
      const response = await axios.get("http://localhost:8000/genres", {
        headers: {
          "Accept": 'application/json'
        },
        params: {
          page: 1,
          size: 99,
        }
      });
      // Get the item array from the Get Genres response and store it in state
      setGenres(response.data.items as Genre[]);
    } catch (error) {
      console.error(error);
    }
  }

  // Triggers data fetching function on page load
  useEffect(() => {
    searchMovies();       // Fetch Search Movies
    getActors();          // Fetch Get Actors
    getDirectors();       // Fetch Get Directors
    getWriters();         // Fetch Get Writers
    getGenres();          // Fetch Get Genres
  }, []);
  
  return (
    <div className="mx-auto">
      <Navbar />
      <div className="m-5">
        <h1 className="text-4xl font-bold">Most Popular Movies</h1>
      </div>

      <div className="border-3 border-orange-400 mx-40 my-10 p-3 rounded-xl">
        <div className="justify-self-center flex gap-8">
          <div className="w-40 h-40">
            <img src="/camera.png" alt="camera"/>
          </div>
          <div className="flex flex-col gap-5">
            
            <div className="flex gap-12">
              <div className="flex gap-3">
                <Label htmlFor="select-year">Year</Label>
                <NativeSelect id="select-year" className="bg-orange-400" 
                              value={selectedYear} 
                              onChange={e => onYearSelected(e.target.value)}>
                  <NativeSelectOption value="">Select year</NativeSelectOption>
                  {Array.from({length: new Date().getFullYear() - 1930 + 1}, (_, index) => 1930 + index).reverse().map(year => (
                    <NativeSelectOption key={year} value={year}>{year}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex gap-3">
                <Label htmlFor="select-writer">Writer</Label>
                <NativeSelect id="select-writer" className="bg-orange-400" 
                              value={selectedWriter} 
                              onChange={e => onWriterSelected(e.target.value)}>
                  <NativeSelectOption value="">Select writer</NativeSelectOption>
                  {writers.map(writer => (
                    <NativeSelectOption key={writer.writerId} value={writer.writerName}>{writer.writerName}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex gap-3">
                <Label htmlFor="select-actor">Actor</Label>
                <NativeSelect id="select-actor" className="bg-orange-400" 
                              value={selectedActor} 
                              onChange={e => onActorSelected(e.target.value)}>
                  <NativeSelectOption value="">Select actor</NativeSelectOption>
                  {actors.map(actor => (
                    <NativeSelectOption key={actor.actorId} value={actor.actorName}>{actor.actorName}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex gap-3">
                <Label htmlFor="select-director">Director</Label>
                <NativeSelect id="select-director" className="bg-orange-400" 
                              value={selectedDirector} 
                              onChange={e => onDirectorSelected(e.target.value)}>
                  <NativeSelectOption value="">Select director</NativeSelectOption>
                  {directors.map(director => (
                    <NativeSelectOption key={director.directorId} value={director.directorName}>{director.directorName}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
            
            <InputGroup className="border-2 border-orange-400 w-200 rounded-md">
              <InputGroupInput className="" type="search" placeholder="Search" 
                               onChange={e => onSearchTextChange(e.target.value)}/>
              <InputGroupAddon align="inline-end">
                <SearchIcon color="#E5831A" />
              </InputGroupAddon>
            </InputGroup>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full max-w-[45rem] mx-12"
            >
              <CarouselContent>
                {genres.map((genre, index) => (
                  <CarouselItem key={index} className="basis-1/8">
                    <Badge className={cn("hover:bg-orange-400 hover:text-white bg-transparent text-gray-800 border-orange-400 px-3 py-1 cursor-pointer", 
                                      selectedGenre === genre.genreName ? "bg-orange-400" : "")} 
                           onClick={() => onGenreSelected(genre.genreName)}>
                      {genre.genreName}
                    </Badge>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {movies.map(movie => (
          <Card key={movie.movieId}
                className="w-90 mt-3 justify-self-center bg-orange-200 border-orange-400 border-1 mt-2 pt-0 overflow-hidden">
            <Link href={"/movies/" + movie.movieId} className="h-full w-full">
              <img src={movie.cover} alt={movie.movieName} className="h-full w-full object-cover"/>
            </Link>
            <CardHeader>
              <CardTitle>
                <Link href={"/movies/" + movie.movieId}>{movie.movieName}</Link>
              </CardTitle>
              <CardDescription className="flex">
                <div className="mr-9">{movie.year}</div>
                <div className="mr-9">{movie.length}</div>
                <Star className="mr-1" fill="#F3B413" color="#F3B413"/>
                <div className="font-bold ">{movie.movieRating}</div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

    </div>
  )
}
