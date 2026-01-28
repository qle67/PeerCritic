"use client";

import {Menu} from "lucide-react";

import {Accordion,} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,} from "@/components/ui/sheet";
import {Input} from "@/components/ui/input";
import {useEffect, useState} from "react";
import axios from 'axios';

const menu = [
  {
    title: "Home",
    url: "/"
  },
  {
    title: "Movies",
    url: "/movies"
  },
  {
    title: "TV shows",
    url: "/tvshows"
  },
  {
    title: "Music",
    url: "/music"
  },
  {
    title: "Discussion",
    url: "/discussion"
  }
]

interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);
  // Get current logged in information
  async function fetchUser() {
    const token = localStorage.getItem("accessToken");
    if(!token) {
      setUser(null);
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/current_user", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      console.log(response);
      setUser(response.data);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        setUser(null);
        return;
      }
      console.error(error);
    }

  }
  
  // check if user is logged in (local storage will store access token)
  function isUserLoggedIn() {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken != null && accessToken != "") {
      return true;
    }
    return false;
  }
  
  function logout() {
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <section>
      <div className="mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex bg-orange-500 p-2">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-white">
                PeerCritic
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="bg-orange-400 rounded-lg">
                  {menu.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        href={item.url}
                        className="bg-background hover:bg-orange-200 hover:text-accent-foreground group 
                                   inline-flex h-10 w-max items-center justify-center rounded-md px-4 
                                   py-2 text-sm font-medium transition-colors bg-orange-400 text-white">
                        {item.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Input className="bg-orange-800 text-white !placeholder-white w-100 rounded-full" type="search" placeholder="Search"/>
          </div>

          {user != null
            ? (
              <div>
                <div className="flex items-center gap-3 text-lg font-semibold tracking-tighter">
                  <a href="/profile" className="flex items-center gap-2 mr-5">
                  {user.avatar && (
                    <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-orange-200"/>
                  )}
                    Hello, {user.firstName} {user.lastName}
                  </a>
                  <Button asChild size="sm">
                    <a href="/" onClick={logout}>LOGOUT</a>
                  </Button>
                </div>
              </div>
            )
            : (
              <div className="flex gap-2">
                <Button className="bg-orange-400 text-white" asChild variant="outline" size="sm">
                  <a href="/login">LOGIN</a>
                </Button>
                <Button className="bg-orange-800 text-white" asChild size="sm">
                  <a href="/signup">SIGNUP</a>
                </Button>
              </div>
            )}
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between text-2xl font-bold">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 ">
              PeerCritic
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="size-4"/>
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href="/" className="flex items-center gap-2 font-bold">
                      PeerCritic
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion type="single" collapsible className="flex w-full flex-col gap-4">
                    {menu.map((item) => (
                      <a key={item.title} href={item.url} className="text-md font-semibold">
                        {item.title}
                      </a>
                    ))}
                  </Accordion>

                  {user != null
                    ? (
                      <div>
                        <div className="text-lg font-semibold tracking-tighter">
                          <a href="/profile" className="mr-5">
                            Hello, {user.firstName} {user.lastName}
                          </a>
                          <Button asChild size="sm">
                            <a href="/" onClick={logout}>LOGOUT</a>
                          </Button>
                        </div>
                      </div>
                    )
                    : (
                      <div className="flex flex-col gap-3">
                        <Button asChild variant="outline">
                          <a href="/login">LOGIN</a>
                        </Button>
                        <Button asChild>
                          <a href="/signup">SIGNUP</a>
                        </Button>
                      </div>
                    )
                  }


                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};