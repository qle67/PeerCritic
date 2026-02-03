"use client"

import Navbar from "@/app/navbar";
import {Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet} from "@/components/ui/field";
import { AvatarDropDown, DEFAULT_AVATARS } from "@/components/ui/avatarDropDown";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import axios from 'axios';

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
      if(user != null) {
        setUpdated(false);
        setUserId(user.userId);
        fetchReviews(user.userId);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        if(user.email != null) {
          setEmail(user.email);
        }
        if(user.avatar != null) {
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
      const response = await axios.put("http://localhost:8000/users/" + userId , {
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
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">

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
          <div className="w-full max-w-xl">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Reviews</h2>
                <span className="text-sm text-gray-500">
                  {loadingReviews ? "Loading..." : `${reviews.length} total`}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {loadingReviews ? (
                  <div className="text-gray-600">Loading your reviews…</div>
                ) : reviews.length === 0 ? (
                  <div className="text-gray-600">
                    You haven’t written any reviews yet.
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div key={r.reviewId} className="rounded-md border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-sm text-gray-700">
                          {r.review ?? (
                            <span className="text-gray-400">No written review.</span>
                          )}
                        </div>
                        <div className="shrink-0 rounded-full border px-3 py-1 text-sm">
                          {r.reviewRating.toFixed(1)}/10
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

}
