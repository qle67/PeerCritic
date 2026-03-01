
export interface UserProfile {
  userId: number;         // Unique identifier
  username: string;       // Public username (non editable)
  firstName: string;
  lastName: string;
  email: string | null;
  avatar: string | null;
}

// Payload sent when updating.
export interface UserProfileUpdate {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}