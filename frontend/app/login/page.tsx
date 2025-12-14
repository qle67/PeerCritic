"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import axios from 'axios';
import {useRouter} from 'next/navigation';

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { push } = useRouter();
  
  async function login(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", new URLSearchParams({
        username,
        password,
      }));
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
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter username and password to login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input id="username"
                         type="username"
                         value={username}
                         onChange={e => setUsername(e.target.value)}
                         required/>
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password"
                         type="password"
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         required/>
                </Field>
                <Field>
                  <Button type="button" onClick={login}>Login</Button>
                  <Button variant="outline" type="button">
                    <a href="/">Cancel</a>
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/signup">Sign up</a>
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
