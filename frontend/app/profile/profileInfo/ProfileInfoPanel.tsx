"use client";

import { useEffect, useState } from "react";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarDropDown, DEFAULT_AVATARS } from "@/components/ui/avatarDropDown";

import type { UserProfile } from "./types";
import { fetchCurrentUserProfile, updateUserProfile } from "./api";

/**
 * Responsibilities:
 * - Fetching current user's profile
 * - Managing profile form
 * - Submitting changes to backend
 */

export default function ProfileInfoPanel() {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Editable form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(DEFAULT_AVATARS[0]);

  // UI state
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const u = await fetchCurrentUserProfile();
      setUser(u);
      setFirstName(u.firstName ?? "");
      setLastName(u.lastName ?? "");
      setEmail(u.email ?? "");
      setAvatar(u.avatar ?? DEFAULT_AVATARS[0]);
      setUpdated(false);
    } catch (e) {
      console.error("Failed to load profile", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Profile update submission
  async function onUpdate(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(user.userId, {
        firstName,
        lastName,
        email,
        avatar,
      });
      setUser(updatedUser);
      setUpdated(true);
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldGroup>
            {/*First Name*/}
            <Field>
              <FieldLabel htmlFor="firstname">First Name</FieldLabel>
              <Input
                id="firstname"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setUpdated(false);
                }}
                required
                disabled={loading}
              />
            </Field>
            
            {/*Last Name*/}
            <Field>
              <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
              <Input
                id="lastname"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setUpdated(false);
                }}
                required
                disabled={loading}
              />
            </Field>

            {/*Email*/}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setUpdated(false);
                }}
                disabled={loading}
              />
            </Field>
            
            {/*Avatar Selection*/}
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

        {/*Actions*/}
        <Field orientation="horizontal">
          <Button type="button" onClick={onUpdate} disabled={loading || saving}>
            {saving ? "Updating..." : "Update"}
          </Button>

          <Button variant="outline" type="button" disabled={loading} onClick={load}>
            Reset
          </Button>
        </Field>
      </FieldGroup>
    </div>
  );
}