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
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);
  // Get current logged in information
  async function fetchUser() {
    if (isUserLoggedIn()) {
      try {
        const response = await axios.get("http://localhost:8000/current_user", {
          headers: {
            "Authorization": "Bearer " + localStorage.getItem("accessToken"),
            "Accept": 'application/json'
          }
        });
        console.log(response);
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
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
    localStorage.setItem("accessToken", "");
  }

  return (
    <section className="py-4">
      <div className="container mx-auto">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                PeerCritic
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      <NavigationMenuLink
                        href={item.url}
                        className="bg-background hover:bg-muted hover:text-accent-foreground group 
                                   inline-flex h-10 w-max items-center justify-center rounded-md px-4 
                                   py-2 text-sm font-medium transition-colors">
                        {item.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Input type="search" placeholder="Search"/>
          </div>

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
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href="/login">LOGIN</a>
                </Button>
                <Button asChild size="sm">
                  <a href="/signup">SIGNUP</a>
                </Button>
              </div>
            )}
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
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
                    <a href="/" className="flex items-center gap-2">
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