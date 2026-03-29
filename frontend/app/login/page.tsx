"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import axios from 'axios';
import {useRouter} from 'next/navigation';

// Export the default page component
export default function Page() {
  // Create useState 
  const [username, setUsername] = useState("");  // State variable for storing the username input value, start at an empty string
  const [password, setPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // State variable to track if the form is submitted.

  // Destructure the push function from useRouter to allow navigating to other pages
  const { push } = useRouter();
  
  // The login function runs when the login button is clicked
  async function login(e: React.MouseEvent<HTMLButtonElement>) {
    setIsSubmitted(true); 
    e.preventDefault();   // prevent the default browser behavior on button click
    try {
      //Send a POST request to the local backend login endpoint with username and password
      const response = await axios.post("http://localhost:8000/login", new URLSearchParams({
        username,
        password,
      }));
      // Log the server response data to the browser console for debugging
      console.log(response.data);  
      // Store the access token in localStorage
      localStorage.setItem("accessToken", response.data.access_token);
      // Navigate the user to the home page when successful login
      push('/');
    } catch (error) {
      console.error(error);
    }
  }
  
  // Return or render block to define the login page UI
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-orange-100">
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter username and password to login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                {/* Username field*/}
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input id="username"
                         className="border-gray-300"
                         type="username"
                         value={username}
                         onChange={e => setUsername(e.target.value)}
                         required
                  />
                  {isSubmitted && username.length <= 0 && (<FieldError>Username is required!</FieldError>)}
                </Field>

                {/* Password field*/}
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {/*<a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-orange-400">*/}
                    {/*  Forgot your password?*/}
                    {/*</a>*/}
                  </div>
                  <Input id="password"
                         className="border-gray-300"
                         type="password"
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         required
                  />
                  {isSubmitted && password.length <= 0 && (<FieldError>Password is required!</FieldError>)}
                </Field>

                {/* Action field contains the submit and cancel buttons and signup link*/}
                <Field>
                  <Button className="bg-orange-400 hover:bg-orange-800" type="button" onClick={login}>Login</Button>
                  <Button className="bg-transparent border-orange-400" variant="outline" type="button">
                    <a href="/">Cancel</a>
                  </Button>
                  <FieldDescription className="text-center text-orange-400">
                    Don&apos;t have an account? <a className="font-bold" href="/signup">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
