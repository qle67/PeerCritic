"use client"

import Navbar from "@/app/navbar";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { AvatarDropDown, DEFAULT_AVATARS } from "@/components/ui/avatarDropDown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Star } from "lucide-react";

interface User {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  avatar: string | null;
}

interface Review {
  reviewId: number;
  review: string | null;
  reviewRating: number;
  reviewRatingCount: number | null;

  kind: "movie" | "song"
  title: string;
  cover?: string | null;

  movieId: number | null;
  songId: number | null;
}

export default function Page() {
  const [userId, setUserId] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(DEFAULT_AVATARS[0]);
  const [updated, setUpdated] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "song">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"default" | "high" | "low" | "title">("default");

  const countByKind = (k: "movie" | "song") => reviews.filter(r => r.kind === k).length;

  const filteredReviews = reviews
    .filter(r => activeTab === "all" || r.kind === activeTab)
    .filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "high") return b.reviewRating - a.reviewRating;
      if (sort === "low") return a.reviewRating - b.reviewRating;
      if (sort == "title") return a.title.localeCompare(b.title);
      return 0;
    });

  async function fetchReviews(uid: number) {
    setLoadingReviews(true);
    try {
      const res = await axios.get(`http://localhost:8000/my/reviews`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });
      setReviews(res.data ?? []);
    } catch (error) {
      console.error(error);
      setReviews([]);
    }
    finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    try {
      const response = await axios.get("http://localhost:8000/current_user", {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "Accept": "application/json"
        }
      });
      const user: User = response.data
      if (user != null) {
        setUpdated(false);
        setUserId(user.userId);
        fetchReviews(user.userId);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        if (user.email != null) {
          setEmail(user.email);
        }
        if (user.avatar != null) {
          setAvatar(user.avatar ?? DEFAULT_AVATARS[0]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  // Update profile function
  async function update(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:8000/users/" + userId, {
        firstName,
        lastName,
        email,
        avatar
      }, {
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "Accept": 'application/json'
        }
      });
      console.log(response.data);
      setUpdated(true);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="px-10 pt-10">
        <h1 className="text-4xl font-bold">User Profile</h1>

        {/*Grid*/}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:items-start">

          {/*Edit Profile*/}
          <div className="w-full max-w-md">
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                    <Input
                      id="firstname"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                    <Input
                      id="lastname"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Avatar</FieldLabel>
                    <AvatarDropDown
                      selected={avatar}
                      setSelected={(v) => {
                        setAvatar(v);
                        setUpdated(false);
                      }}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSet>
                {updated ? (
                  <FieldLegend>
                    <span className="text-red-500">Profile is updated!</span>
                  </FieldLegend>
                ) : (
                  <FieldLegend />
                )}
              </FieldSet>

              <Field orientation="horizontal">
                <Button type="button" onClick={update}>Update</Button>
                <Button variant="outline" type="button">
                  <a href="/">Cancel</a>
                </Button>
              </Field>
            </FieldGroup>
          </div>

          {/*Your Reviews*/}
          <div className="w-full max-w-xl flex flex-col min-h-0 self-start">
            {/*Outer card*/}
            <div className="rounded-lg border border-border bg-background/80 backdrop-blur-sm p-6 shadow-sm flex flex-col min-h-0 max-h-[calc(100vh-16rem)]">


              {/*Header*/}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Your Reviews</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {loadingReviews ? "Loading..." : `${reviews.length} total`}
                  </p>
                </div>

                {/*Tabs*/}
                <div className="inline-flex items-center gap-1">
                  {(
                    [
                      { key: "all", label: "All", count: reviews.length },
                      { key: "movie", label: "Movies", count: reviews.filter(r => r.kind === "movie").length },
                      { key: "song", label: "Songs", count: reviews.filter(r => r.kind === "song").length },
                    ] as const
                  ).map((t) => (
                    <Button
                      key={t.key}
                      size="sm"
                      variant={activeTab === t.key ? "default" : "ghost"}
                      onClick={() => setActiveTab(t.key)}
                      className={`rounded-full px-4 border-orange-300 ${activeTab === t.key
                          ? "bg-orange-400 text-white hover:bg-orange-500"
                          : "bg-background text-black hover:bg-orange-100"
                        }`}
                    >
                      <span className="mr-2">{t.label}</span>
                      <span className={`text-xs ${activeTab === t.key ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                        ({t.count})
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/*Search and Sort*/}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Input
                  placeholder="Search by title..."
                  value={query}
                  onChange={(e: any) => setQuery(e.target.value)}
                  className="max-w-full"
                />

                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground sm:w-[180px]"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                >
                  <option value="default">Default order</option>
                  <option value="high">Highest rating</option>
                  <option value="low">Lowest rating</option>
                  <option value="title">Title (A–Z)</option>
                </select>
              </div>

              {/*List*/}
              <div className="mt-4 flex-1 overflow-y-auto pb-2">
                {loadingReviews ? (
                  <div className="text-muted-foreground">Loading your reviews…</div>
                ) : filteredReviews.length === 0 ? (
                  <div className="text-muted-foreground">
                    {reviews.length === 0 ? "You haven’t written any reviews yet." : "No reviews match your filters."}
                  </div>
                ) : (
                  <div className="divide-y divide-border rounded-md border border-border bg-background/60">
                    {filteredReviews.map((r) => (
                      <details key={r.reviewId} className="group">
                        <summary className="flex cursor-pointer list-none items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                          {/*Cover*/}
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                            {r.cover ? (
                              <img
                                src={r.cover}
                                alt={r.title}
                                className="h-full w-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                No cover
                              </div>
                            )}
                          </div>

                          {/*Title and meta*/}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate font-medium text-foreground">{r.title}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span className="rounded-full border border-border px-2 py-0.5 text-xs bg-background text-muted-foreground">
                                    {r.kind === "movie" ? "Movie" : "Song"}
                                  </span>
                                  {r.reviewRatingCount != null && (
                                    <span className="text-xs text-muted-foreground">{r.reviewRatingCount} ratings</span>
                                  )}
                                </div>
                              </div>

                              {/*Rating pill*/}
                              <div className="shrink-0 flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
                                <Star className="h-4 w-4 fill-[#F3B413] text-[#F3B413]" />
                                <span className="text-sm font-semibold text-blue-700">
                                  {r.reviewRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-muted-foreground">/10</span>
                              </div>
                            </div>

                            {/*Preview*/}
                            <div className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                              {r.review ? r.review : <span className="text-muted-foreground/70">No written review.</span>}
                            </div>

                            <div className="mt-2 text-xs text-muted-foreground/70 group-open:hidden">Click to expand</div>
                          </div>
                        </summary>

                        {/*Expanded content*/}
                        <div className="px-4 pb-4 pt-0">
                          <div className="rounded-md bg-background/70 p-3 text-sm text-foreground border border-border/50">
                            {r.review ? r.review : <span className="text-muted-foreground/70">No written review.</span>}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );

}
