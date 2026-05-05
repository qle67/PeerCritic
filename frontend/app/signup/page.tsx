"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { AvatarDropDown, DEFAULT_AVATARS } from "@/components/ui/avatarDropDown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";

// Default export - the main component rendered at the /signup route
export default function Page() {
  // Create useState
  const [firstName, setFirstName] = useState("");     //stores the value typed into the first name input field, starts as empty string
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);    //tracks if the user clicks create account at least once

  // avatars
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(DEFAULT_AVATARS[0]);

  // Destructure push from the Next.js router to automatically navigate to  a new page
  const { push } = useRouter();

  const searchParams = useSearchParams();

  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/";

  // Signup function runs when the Create Account button is clicked
  async function signup(e: React.MouseEvent<HTMLButtonElement>) {
    // activates validation error visibility across all fields
    setIsSubmitted(true);
    // Validate passwords 
    if (password != confirmPassword || password.length < 6) {
      return;
    }
    // Prevent the browser's default behavior of reloading the page on button click
    e.preventDefault();
    try {
      // Send a POST request to the backend /signup endpoint with all form data as a JSON body
      const response = await axios.post("http://localhost:8000/signup", {
        username,
        password,
        firstName,
        lastName,
        avatar: selectedAvatar,
      });
      console.log(response.data);
      // Save the access token returned by the server into localStorage.
      localStorage.setItem("accessToken", response.data.access_token);
      // Navigate the user to the home page after successful signup
      push(next);
    } catch (error) {
      console.error(error);
    }
  }

  // Return or render block to define the signup page UI
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="bg-orange-100">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {/* First name field */}
              <Field>
                <FieldLabel htmlFor="name">First Name</FieldLabel>
                <Input id="name"
                  className="border-gray-300"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
                {/* Show the error message only if the user attempt to submit and the field is empty */}
                {isSubmitted && firstName.length <= 0 && (<FieldError>First name is required!</FieldError>)}
              </Field>

              {/* Last name field */}
              <Field>
                <FieldLabel htmlFor="name">Last Name</FieldLabel>
                <Input id="name"
                  className="border-gray-300"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
                {/* Show error only after first submission attempt if the field is still empty */}
                {isSubmitted && lastName.length <= 0 && (<FieldError>Last name is required!</FieldError>)}
              </Field>

              {/* Username field */}
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username"
                  className="border-gray-300"
                  type="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
                {/* Show error only after first submission attempt if the field is still empty */}
                {isSubmitted && username.length <= 0 && (<FieldError>Username is required!</FieldError>)}
              </Field>

              {/* Password field */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password"
                  className="border-gray-300"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                {/* Live validation: if password has less than 6 characters, show error. Otherwise, show a hint */}
                {password.length > 0 && password.length < 6
                  ? (<FieldError>Password must be at least 6 characters!</FieldError>)
                  : (<FieldDescription>Must be at least 6 characters long.</FieldDescription>)
                }
              </Field>

              {/* Confirm password field */}
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input id="confirm-password"
                  className="border-gray-300"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                {/* Live validation: if the 2 password don't match and the field is not empty, show the error. Otherwise, show a hint */}
                {password != confirmPassword && confirmPassword.length > 0
                  ? (<FieldError>Passwords don't match!</FieldError>)
                  : (<FieldDescription>Please confirm your password.</FieldDescription>)
                }
              </Field>

              {/* Avatar field */}
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <AvatarDropDown selected={selectedAvatar} setSelected={setSelectedAvatar} />
              </Field>

              {/* Action buttons */}
              <FieldGroup>
                <Field>
                  <Button className="bg-orange-400 hover:bg-orange-800" type="button" onClick={e => signup(e)}>Create Account</Button>
                  <Button
                    className="bg-transparent border-orange-400"
                    variant="outline"
                    type="button"
                    onClick={() => push(next)}
                  >
                    Cancel
                  </Button>
                  <FieldDescription className="px-6 text-center text-orange-400">
                    Already have an account?{" "}
                    <Link
                      className="font-bold"
                      href={`/login?next=${encodeURIComponent(next)}`}
                    >
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
