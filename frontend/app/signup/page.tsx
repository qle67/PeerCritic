"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import axios from 'axios';
import {useRouter} from 'next/navigation';

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { push } = useRouter();

  async function signup(e: React.MouseEvent<HTMLButtonElement>) {
    setIsSubmitted(true);
    if (password != confirmPassword || password.length < 6) {
      return;
    }
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/signup", {
        username,
        password,
        firstName,
        lastName,
      });
      console.log(response.data);
      localStorage.setItem("accessToken", response.data.access_token);
      push('/');
    } catch (error) {
      console.error(error);
    }
  }

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
              <Field>
                <FieldLabel htmlFor="name">First Name</FieldLabel>
                <Input id="name"
                       className="border-gray-300"
                       type="text"
                       value={firstName}
                       onChange={e => setFirstName(e.target.value)}
                       required
                />
                {isSubmitted && firstName.length <= 0 && (<FieldError>First name is required!</FieldError>)}
              </Field>
              <Field>
                <FieldLabel htmlFor="name">Last Name</FieldLabel>
                <Input id="name"
                       className="border-gray-300"
                       type="text"
                       value={lastName}
                       onChange={e => setLastName(e.target.value)}
                       required
                />
                {isSubmitted && lastName.length <= 0 && (<FieldError>Last name is required!</FieldError>)}
              </Field>
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
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password"
                       className="border-gray-300"
                       type="password"
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                       required
                />
                {password.length > 0 && password.length < 6
                  ? (<FieldError>Password must be at least 6 characters!</FieldError>)
                  : (<FieldDescription>Must be at least 6 characters long.</FieldDescription>)
                }

              </Field>
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
                {password != confirmPassword && confirmPassword.length > 0
                  ? (<FieldError>Passwords don't match!</FieldError>)
                  : (<FieldDescription>Please confirm your password.</FieldDescription>)
                }
              </Field>
              <FieldGroup>
                <Field>
                  <Button className="bg-orange-400 hover:bg-orange-800" type="button" onClick={e => signup(e)}>Create Account</Button>
                  <Button className="bg-transparent border-orange-400" variant="outline" type="button">
                    <a href="/">Cancel</a>
                  </Button>
                  <FieldDescription className="px-6 text-center text-orange-400">
                    Already have an account? <a className="font-bold" href="/login">Sign in</a>
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
