"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Field, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";
import axios from 'axios';
import {useRouter} from 'next/navigation';

const DEFAULT_AVATARS = Array.from({length: 10}, (_, i) => `/assets/avatars/avatar-${String(i + 1).padStart(2, "0")}.png`);
const DROPDOWN_COUNT = 10;
// path: C:\PeerCritic Project\PeerCritic\frontend\assets\avatars\avatar-01.png

function AvatarDropDown({selected, setSelected,}: {
  selected: string | null;
  setSelected:(v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e:MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const avatarsToDisplay = DEFAULT_AVATARS.slice(0, DROPDOWN_COUNT);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen((s) => !s)}
      className="flex items-center gap-3 px-3 py-2 bg-transparent border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
          {selected ? (
            <img src={selected} alt="selected avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No</div>
          )}
        </div>
        <span className="text-sm text-black">Choose your avatar!</span>
        <svg
        className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        >
          <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
        role="dialog"
        aria-modal="false"
        className="absolute z-20 mt-2 w-64 bg-white border rounded-lg shadow-lg p-3"
        style={{ minWidth: 0 }}
        >
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {avatarsToDisplay.map((a) => {
             const isSelected = a === selected;
             return (
              <button
              key={a}
              type="button"
              onClick={() => {
                setSelected(a);
                setOpen(false);
              }}
              aria-pressed={isSelected}
              className={`w-full h-16 rounded-full overflow-hidden flex items-center justify-center border ${
                isSelected ? "ring-2 ring-orange-400" : "hover:opacity-90"
              }`}
              >
                <img src={a} alt="avatar option" className="w-full h-full object-cover" />
              </button>
             );
            })}
          </div>

          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">Pick an avatar</div>
          </div>
    </div>
    )}
  </div>
  );
}

export default function Page() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // avatars
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(DEFAULT_AVATARS[0]);
  const [submitting, setSubmitting] = useState(false);

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
        avatar: selectedAvatar,
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
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <AvatarDropDown selected={selectedAvatar} setSelected={setSelectedAvatar}/>
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
