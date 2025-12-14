"use client"

import Navbar from "@/app/navbar";
import {Field, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet} from "@/components/ui/field";
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

export default function Page() {
  const [userId, setUserId] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [updated, setUpdated] = useState(false);

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
        setFirstName(user.firstName);
        setLastName(user.lastName);
        if(user.email != null) {
          setEmail(user.email);
        }
        if(user.avatar != null) {
          setAvatar(user.avatar);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  
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
    <div className="container mx-auto">
      <Navbar />
      <div className="">
        <h1 className="text-4xl font-bold">User Profile</h1>
        <div className="w-full max-w-md my-10">
          <FieldGroup>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="firstname">
                    First Name
                  </FieldLabel>
                  <Input
                    id="firstname"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastname">
                    Last Name
                  </FieldLabel>
                  <Input
                    id="lastname"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="avatar">
                    Avatar
                  </FieldLabel>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                  />
                </Field>

              </FieldGroup>
            </FieldSet>
            {/*<FieldSeparator/>*/}
            <FieldSet>
              {updated ? (
                <FieldLegend>
                  <span className="text-red-500">
                    Profile is updated!
                  </span>
                </FieldLegend>
              ) : (
                <FieldLegend></FieldLegend>
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
      </div>
    </div>
  )
}
