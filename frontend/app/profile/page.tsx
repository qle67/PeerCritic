"use client"

import Navbar from "@/app/navbar";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { AvatarDropDown, DEFAULT_AVATARS } from "@/components/ui/avatarDropDown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Star, Check, X, RotateCcw, Plus, MoreVertical } from "lucide-react";
import { createPortal } from "react-dom";
import { useRef } from "react";

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

interface Friend {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
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

  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendQuery, setFriendQuery] = useState("");
  const [friendsTab, setFriendsTab] = useState<"friends" | "received" | "sent">("friends");
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Friend[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [friendsMode, setFriendsMode] = useState<"list" | "add">("list");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<Friend[]>([]);
  const [loadingUserSearch, setLoadingUserSearch] = useState(false);
  const [openFriendKebab, setOpenFriendKebab] = useState<number | null>(null);
  const [kebabPos, setKebabPos] = useState<{ top: number; left: number } | null>(null);
  const kebabBtnRef = useRef<HTMLButtonElement | null>(null);


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
      const res = await axios.get("http://localhost:8000/my/reviews", {
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

  async function fetchFriends() {
    setLoadingFriends(true);
    try {
      const res = await axios.get("http://localhost:8000/my/friends", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });
      setFriends(res.data ?? []);
    } catch (error) {
      console.error(error);
      setFriends([]);
    }
    finally {
      setLoadingFriends(false);
    }
  }

  const tabCounts = {
    friends: friends.length,
    received: receivedRequests.length,
    sent: sentRequests.length,
  };

  const currentList =
    friendsTab === "friends"
      ? friends
      : friendsTab === "received"
        ? receivedRequests
        : sentRequests;

  const filteredCurrentList = currentList.filter((f) =>
    f.username.toLowerCase().includes(friendQuery.toLowerCase())
  );

  const isLoadingFriendsSection = loadingFriends || loadingRequests;

  async function sendFriendRequest(addresseeId: number) {
    const pendingUser = userSearchResults.find((u) => u.userId === addresseeId);
    if (pendingUser) {
      setSentRequests((prev) =>
        prev.some((x) => x.userId === addresseeId) ? prev : [pendingUser, ...prev]
      );
    }

    try {
      await axios.post(`http://localhost:8000/my/friends/request/${addresseeId}`, null, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });

      fetchSentRequests();
      fetchFriends();
    } catch (error) {
      console.error(error);
      setSentRequests((prev) => prev.filter((x) => x.userId !== addresseeId));
    }
  }


  async function acceptRequest(requesterId: number) {
    try {
      await axios.post(`http://localhost:8000/my/friends/accept/${requesterId}`, null, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });

      // refresh
      fetchFriends();
      fetchReceivedRequests();
    } catch (error) {
      console.error(error);
    }
  }

  async function declineRequest(requesterId: number) {
    setReceivedRequests((prev) => prev.filter((u) => u.userId !== requesterId));

    try {
      await axios.post(`http://localhost:8000/my/friends/decline/${requesterId}`, null, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });

      fetchReceivedRequests();
    } catch (error: any) {
      console.error("declineRequest failed", {
        message: error?.message,
        code: error?.code,
        url: error?.config?.url,
        hasResponse: !!error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      fetchReceivedRequests();
    }
  }

  async function removeFriend(friendId: number) {
    setFriends((prev) => prev.filter((u) => u.userId !== friendId));
    setOpenFriendKebab(null);

    try {
      await axios.delete(`http://localhost:8000/my/friends/${friendId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });
      fetchFriends();
    } catch (error) {
      console.error(error);
      fetchFriends();
    }
  }

  async function undoSentRequest(addresseeId: number) {
    setSentRequests((prev) => prev.filter((u) => u.userId !== addresseeId));

    try {
      await axios.delete(`http://localhost:8000/my/friends/request/${addresseeId}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });

      fetchSentRequests();
    } catch (error) {
      console.error(error);
      fetchSentRequests();
    }
  }

  async function fetchReceivedRequests() {
    setLoadingRequests(true);
    try {
      const res = await axios.get("http://localhost:8000/my/friend_requests/received", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });
      setReceivedRequests(res.data ?? []);
    } catch (error) {
      console.error(error);
      setReceivedRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }

  async function fetchSentRequests() {
    setLoadingRequests(true);
    try {
      const res = await axios.get("http://localhost:8000/my/friend_requests/sent", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });
      setSentRequests(res.data ?? []);
    } catch (error) {
      console.error(error);
      setSentRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }

  async function searchUsersByUsername(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      setUserSearchResults([]);
      return;
    }

    setLoadingUserSearch(true);
    try {
      // TODO: implement backend for user search
      const res = await axios.get("http://localhost:8000/users/search", {
        params: { username: trimmed },
        headers: {
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
          Accept: "application/json",
        },
      });

      setUserSearchResults(res.data ?? []);
    } catch (error) {
      console.error(error);
      setUserSearchResults([]);
    } finally {
      setLoadingUserSearch(false);
    }
  }

  useEffect(() => {
    if (friendsMode !== "add") return;

    const t = setTimeout(() => {
      searchUsersByUsername(userSearchQuery);
    }, 300);

    return () => clearTimeout(t);
  }, [friendsMode, userSearchQuery]);


  useEffect(() => {
    fetchUser();
    fetchFriends();

    //TODO: Implement friend requests (received/sent) on backend
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  // close friend kebab after user clicks anywhere else
  useEffect(() => {
    function onDocMouseDown() {
      if (openFriendKebab !== null) {
        setOpenFriendKebab(null);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [openFriendKebab]);

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

          {/*Friends List*/}
          <div className="w-full lg:col-span-1 self-start">
            <div className="rounded-lg border border-border bg-background/80 backdrop-blur-sm shadow-sm flex flex-col min-h-0 max-h-[calc(100vh-16rem)]">
              {/*Header*/}
              <div className="px-4 pt-4 pb-3 border-b border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold leading-none">Friends</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {friendsMode === "add"
                        ? (loadingUserSearch ? "Searching..." : "Find users to add")
                        : (isLoadingFriendsSection ? "Loading..." : `${currentList.length} total`)}
                    </p>
                  </div>

                  {/*Add/List friends button*/}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      if (friendsMode === "list") {
                        setFriendsMode("add");
                        setUserSearchQuery("");
                        setUserSearchResults([]);
                      } else {
                        setFriendsMode("list");
                        setUserSearchQuery("");
                        setUserSearchResults([]);
                      }
                    }}
                    aria-label={friendsMode === "list" ? "Add friend" : "Close add friend"}
                    title={friendsMode === "list" ? "Add friend" : "Close"}
                  >
                    {friendsMode === "list" ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {friendsMode === "add" ? (
                  /*Add mode*/
                  <div className="mt-3">
                    <Input
                      placeholder="Search users by username…"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                ) : (
                  <>
                    {/*Tabs*/}
                    <div className="mt-3 inline-flex items-center gap-1">
                      {(
                        [
                          { key: "friends", label: "My Friends", count: tabCounts.friends },
                          { key: "received", label: "Received", count: tabCounts.received },
                          { key: "sent", label: "Sent", count: tabCounts.sent },
                        ] as const
                      ).map((t) => (
                        <Button
                          key={t.key}
                          size="sm"
                          variant={friendsTab === t.key ? "default" : "ghost"}
                          onClick={() => setFriendsTab(t.key)}
                          className={`rounded-full px-4 border-orange-300 ${friendsTab === t.key
                            ? "bg-orange-400 text-white hover:bg-orange-500"
                            : "bg-background text-black hover:bg-orange-100"
                            }`}
                        >
                          <span className="mr-2">{t.label}</span>
                          <span
                            className={`text-xs ${friendsTab === t.key
                              ? "text-primary-foreground/90"
                              : "text-muted-foreground"
                              }`}
                          >
                            ({t.count})
                          </span>
                        </Button>
                      ))}
                    </div>

                    {/*Search (friends/requests)*/}
                    <div className="mt-3">
                      <Input
                        placeholder={
                          friendsTab === "friends"
                            ? "Search friends…"
                            : friendsTab === "received"
                              ? "Search friend requests received…"
                              : "Search requests you've sent…"
                        }
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              {/*Body*/}
              <div className="flex-1 overflow-y-auto min-h-0 p-2">
                {friendsMode === "add" ? (
                  <>
                    {loadingUserSearch ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">Searching…</div>
                    ) : userSearchQuery.trim() && userSearchResults.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">No users found.</div>
                    ) : userSearchResults.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        Type a username to search.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {userSearchResults.map((u) => (
                          <div
                            key={u.userId}
                            className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/60 transition-colors"
                          >
                            {/*Avatar*/}
                            <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                              {u.avatar ? (
                                <img
                                  src={u.avatar}
                                  alt={u.username}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-full w-full grid place-items-center text-[10px] text-muted-foreground">
                                  ?
                                </div>
                              )}
                            </div>

                            {/*Username*/}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium leading-tight">
                                {u.username}
                              </div>
                              <div className="truncate text-[11px] text-muted-foreground leading-tight">
                                {u.firstName} {u.lastName}
                              </div>
                            </div>

                            {/*Add friend action*/}
                            {(() => {
                              const isFriend = friends.some((f) => f.userId === u.userId);
                              const isPending = sentRequests.some((r) => r.userId === u.userId);

                              const label = isFriend ? "Already Friends" : isPending ? "Request Pending" : "Add";

                              return (
                                <Button
                                  size="sm"
                                  className={`rounded-full ${isFriend || isPending ? "opacity-60 cursor-not-allowed" : ""}`}
                                  disabled={isFriend || isPending}
                                  onClick={() => sendFriendRequest(u.userId)}
                                  aria-label={
                                    isFriend
                                      ? `${u.username} is already your friend`
                                      : isPending
                                        ? `Friend request pending for ${u.username}`
                                        : `Send friend request to ${u.username}`
                                  }
                                  title={label}
                                  variant={isFriend || isPending ? "outline" : "default"}
                                >
                                  {label}
                                </Button>
                              );
                            })()}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isLoadingFriendsSection ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">Loading…</div>
                    ) : filteredCurrentList.length === 0 ? (
                      <div className="px-2 py-2 text-sm text-muted-foreground">
                        {currentList.length === 0
                          ? friendsTab === "friends"
                            ? "No friends yet."
                            : friendsTab === "received"
                              ? "No received friend requests."
                              : "No sent friend requests."
                          : "No one with that username could be found."}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {filteredCurrentList.map((f) => (
                          <div
                            key={f.userId}
                            className="group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/60 transition-colors"
                          >
                            {/*Avatar*/}
                            <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-muted shrink-0">
                              {f.avatar ? (
                                <img
                                  src={f.avatar}
                                  alt={f.username}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="h-full w-full grid place-items-center text-[10px] text-muted-foreground">
                                  ?
                                </div>
                              )}
                            </div>

                            {/*Username*/}
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium leading-tight">
                                {f.username}
                              </div>
                              <div className="truncate text-[11px] text-muted-foreground leading-tight">
                                {f.firstName} {f.lastName}
                              </div>
                            </div>

                            {/*Actions*/}
                            {friendsTab === "received" ? (
                              <div className="flex items-center gap-1">
                                {/*Accept*/}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="
                          h-8 w-8 shrink-0
                          border border-transparent
                          text-green-600
                          hover:bg-green-600 hover:text-white
                          transition-colors
                        "
                                  onClick={() => acceptRequest(f.userId)}
                                  aria-label={`Accept ${f.username}`}
                                  title="Accept"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>

                                {/*Decline*/}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="
                          h-8 w-8 shrink-0
                          border border-transparent
                          text-red-600
                          hover:bg-red-600 hover:text-white
                          transition-colors
                        "
                                  onClick={() => declineRequest(f.userId)}
                                  aria-label={`Decline ${f.username}`}
                                  title="Decline"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : friendsTab === "sent" ? (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="
                        h-8 w-8 shrink-0
                        border border-transparent
                        text-red-600
                        hover:bg-red-600 hover:text-white
                        transition-colors
                      "
                                onClick={() => undoSentRequest(f.userId)}
                                aria-label={`Undo request to ${f.username}`}
                                title="Undo request"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              <div className="relative flex items-center gap-1">
                                {/*Message*/}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0 opacity-80 group-hover:opacity-100"
                                  onClick={() => {
                                    // TODO: Implement DMs
                                    console.log("Message friend", f.userId);
                                  }}
                                  aria-label={`Message ${f.username}`}
                                  title="Message"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                                  </svg>
                                </Button>

                                {/*Kebab Button*/}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 shrink-0 opacity-80 group-hover:opacity-100"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const btn = e.currentTarget as HTMLButtonElement;
                                    const rect = btn.getBoundingClientRect();

                                    const isOpen = openFriendKebab === f.userId;
                                    if (isOpen) {
                                      setOpenFriendKebab(null);
                                      setKebabPos(null);
                                      return;
                                    }

                                    setOpenFriendKebab(f.userId);
                                    setKebabPos({
                                      top: rect.bottom + window.scrollY + 6,
                                      left: rect.right + window.scrollX,
                                    });
                                  }}
                                  aria-label={`More options for ${f.username}`}
                                  title="More"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {/*Popover*/}
                                {openFriendKebab === f.userId && kebabPos &&
                                  createPortal(
                                    <div
                                      className="fixed z-[9999]"
                                      style={{
                                        top: kebabPos.top,
                                        left: kebabPos.left,
                                        transform: "translateX(-100%)",
                                      }}
                                      onMouseDown={(e) => e.stopPropagation()}
                                    >
                                      <div className="w-44 rounded-md border border-border bg-background shadow-md p-1">
                                        <button
                                          className="w-full rounded-sm px-2 py-2 text-left text-sm text-red-600 hover:bg-muted"
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeFriend(f.userId);
                                          }}
                                        >
                                          Remove Friend
                                        </button>
                                      </div>
                                    </div>,
                                    document.body
                                  )
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );

}